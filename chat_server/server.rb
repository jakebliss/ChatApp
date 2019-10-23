require 'sinatra'

require 'thin'
require 'json'
require 'jwt'

ENV['JWT_SECRET'] = "notasecret"

set :server, :thin
set :connections, {}
set :users, {}
set :server_events, []

#TODO: Handle Disconnect
#TODO: Hookup messages endpoint to appropriate sse 

post '/login' do 
  server_status_sse('Server start')
  username = params[:username]
  password = params[:password]

  if username ==  "" || password == "" 
    [422, []]
  else 
    user = users[username]
    if user == nil 
      token = generate_JWT(username)
        response = {}
        response['token'] = token

        users[username] = create_new_user(password, token)
        join_sse(username)
        [201, {}, response.to_json]
    else   
      if user['password'] == password
        token = generate_JWT(password)
        response = {}
        response['token'] = token

        users[username]['token'] = token
        join_sse(username)
        [201, {}, response.to_json]
      else 
      [403, []]
      end
    end 
  end 
end

post '/:message' do 
  status = 201
  message = params[:message]
  if message == ""
    status = 422
    event = []
  end
  event = []
  token = request.env["HTTP_AUTHORIZATION"]
  if token == "" or token == nil
    status = 422
    event = []
  elsif token.split(' ')[0] != "Bearer"
    status = 422
    event = []
  elsif decode_JWT(token.split(' ')[1] == nil)
    status = 403
    event = []
  elsif find_user(token.split(' ')[1], users) == false
    status = 403
    event = []
  end
  [status, event]
end

get '/stream/:signed_token' do
  token = params[:signed_token]
  decoded_token = decode_JWT(token)
  if decoded_token == nil 
    [403, []]
  else
    existing_out = connections[token]

    if existing_out != nil
      disconnect_sse(token)
    end 

    username = decoded_token[0]['data']
    stream(:keep_open) do |out|
      connections[token] = out
      server_events.each { |event|
        out << "data: " + event['data'].to_json + "\n"
        out << "event: " + event['type'].to_s + "\n"
        out << "id: " + event['id'].to_s + "\n\n"
      }
      users_sse(token)
      #disconnect(params[:signed_token])
      # out.callback {connections.delete(out)}
      # connections.reject!(&:closed?)
    end 
  end
end  

helpers do
  def connections; self.class.connections; end 
  def users; self.class.users; end 
  def server_events; self.class.server_events; end

  def create_new_user(password, token) 
      new_user = {}
      new_user['password'] = password
      new_user['token'] = token
      new_user['stream'] = nil  
      return new_user
  end 

  def generate_JWT(username)
    payload = {}
    payload['data'] = username
    token = JWT.encode payload, ENV['JWT_SECRET'], 'HS256'
    return token
  end

  def decode_JWT(token)
    begin
      if token.split('.').length == 3
        decoded_token = JWT.decode token, ENV['JWT_SECRET'], true, { algorithm: 'HS256' }
        return decoded_token
      else
        return nil
      end
      rescue
        return nil
      end
  end

  def find_user(token, users)
    user_exists = false
    users.each { |key, value|
      if value['token'] == token
        user_exists = true
      end 
    }
    return user_exists
  end

  # TODO: Figure out how to generate IDs for SSE events 
  # TODO: Time might be slightly off

  def disconnect_sse(token)
    out = connections[token]

    if stream != nil
      event = {}
      data = {} 
      data['created'] = Time.new(1993, 02, 24, 12, 0, 0, "+09:00").to_i

      event['data'] = data
      event['type'] = 'Disconnect'
      event['id'] = 'tempID'

      out << "data: " + event['data'].to_json + "\n"
      out << "event: " + event['type'] + "\n"
      out << "id: " + event['id'] + "\n\n"

      out.close
      connections.delete(token)
      add_to_event_queue(event)
    end
  end

  def join_sse(username) 
    event = {}
    data = {}
    data['user'] = username
    data['created'] = Time.new(1993, 02, 24, 12, 0, 0, "+09:00").to_i
    
    event['data'] = data
    event['type'] = 'Join'
    event['id'] = 'tempID'
    
    send_event(event)
    add_to_event_queue(event)
  end

  def message_sse(message, username) 
    event = {}
    data = {}
    data['message'] = message
    data['user'] = username
    data['created'] = Time.new(1993, 02, 24, 12, 0, 0, "+09:00").to_i

    event['data'] = data
    event['type'] = 'Message'
    event['id'] = 'tempID'
    
    send_event(event)
    add_to_event_queue(event)
  end

  def part_sse(username)
    event = {}
    data = {}
    data['user'] = username
    data['created'] = Time.new(1993, 02, 24, 12, 0, 0, "+09:00").to_i

    event['data'] = data
    event['type'] = 'Part'
    event['id'] = 'tempID'
    
    send_event(event)
    add_to_event_queue(event)
  end

  def server_status_sse(status)
    event = {}
    data = {}
    data['status'] = status
    data['created'] = Time.new(1993, 02, 24, 12, 0, 0, "+09:00").to_i
    
    event['data'] = data
    event['type'] = 'ServerStatus'
    event['id'] = 'tempID'
    
    send_event(event)
    add_to_event_queue(event)
  end 

  def users_sse(token)
    out = connections[token]

    if out != nil
      user_list = []
      users.each_key { |user|
        user_list << user 
      }

      event = {}
      data = {}
      data['users'] = user_list
      data['created'] = Time.new(1993, 02, 24, 12, 0, 0, "+09:00").to_i

      event['data'] = data
      event['type'] = 'Users'
      event['id'] = 'tempID'

      out << "data: " + event['data'].to_json + "\n"
      out << "event: " + event['type'] + "\n"
      out << "id: " + event['id'] + "\n\n"

      add_to_event_queue(event)
    end  
  end

  def send_event(event) 
    connections.each_value { |out| 
      out << "data: " + event['data'].to_json + "\n"
      out << "event: " + event['type'].to_s + "\n"
      out << "id: " + event['id'].to_s + "\n\n"
    }
  end

  def add_to_event_queue(event) 
    if server_events.length > 100
      server_events.shift
    end
    server_events.push(event)  
  end


end 