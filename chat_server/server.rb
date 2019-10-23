require 'sinatra'

require 'thin'
require 'json'
require 'jwt'
require 'securerandom'

ENV['JWT_SECRET'] = "notasecret"

set :server, :thin
set :connections, {}
set :users, {}
set :server_events, []
set :last_event_id, ""

#TODO: Handle Disconnect
def self.run!
  server_status_sse('Server Start')
  super
end

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

      last_event_id = users[username]['last_event_id'].to_s

      if last_event_id == nil
        get_old_messages_status(token)
      else 
        get_missed_messages(last_event_id, token)
      end
      users_sse(token)

      disconnect_sse(token, username)
      message_sse('Message send while disconnected', username)
      # out.callback {connections.delete(out)}
    end 
  end
end  

helpers do
  def connections; self.class.connections; end 
  def users; self.class.users; end 
  def server_events; self.class.server_events; end
  def last_event_id; self.class.last_event_id; end

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

  def disconnect_sse(token, username)
    out = connections[token]

    if stream != nil
      event = {}
      data = {} 
      data['created'] = Time.now.to_f

      event['data'] = data
      event['type'] = 'Disconnect'
      event['id'] = generate_encoded_id

      out << "data: " + event['data'].to_json + "\n"
      out << "event: " + event['type'] + "\n"
      out << "id: " + event['id'] + "\n\n"

      users['last_event_id'] = last_event_id
      out.close
      connections.delete(token)
      add_to_event_queue(event)
      part_sse(username)
    end
  end

  def join_sse(username) 
    event = {}
    data = {}
    data['user'] = username
    data['created'] = Time.now.to_f
    
    event['data'] = data
    event['type'] = 'Join'
    event['id'] = generate_encoded_id
    
    send_event(event)
    add_to_event_queue(event)
  end

  def message_sse(message, username) 
    event = {}
    data = {}
    data['message'] = message
    data['user'] = username
    data['created'] = Time.now.to_f

    event['data'] = data
    event['type'] = 'Message'
    event['id'] = generate_encoded_id
    
    send_event(event)
    add_to_event_queue(event)
  end

  def part_sse(username)
    event = {}
    data = {}
    data['user'] = username
    data['created'] = Time.now.to_f

    event['data'] = data
    event['type'] = 'Part'
    event['id'] = generate_encoded_id
    
    send_event(event)
    add_to_event_queue(event)
  end

  def server_status_sse(status)
    event = {}
    data = {}
    data['status'] = status
    data['created'] = Time.now.to_f
    
    event['data'] = data
    event['type'] = 'ServerStatus'
    event['id'] = generate_encoded_id
    
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
      data['created'] = Time.now.to_f

      event['data'] = data
      event['type'] = 'Users'
      event['id'] = generate_encoded_id

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

  def get_old_messages_status(token)
    out = connections[token]
    server_events.each { |event|
      if event['type'] == 'Message' || event['type'] == 'ServerStatus'
        out << "data: " + event['data'].to_json + "\n"
        out << "event: " + event['type'].to_s + "\n"
        out << "id: " + event['id'].to_s + "\n\n"
      end
    }
  end

  def get_missed_messages(last_event_id, token)
    out = connections[token] 
    last_message_found = false 

    server_events.each { |event|
      if last_message_found
        if event['type'] == 'Message'
          out << "data: " + event['data'].to_json + "\n"
          out << "event: " + event['type'].to_s + "\n"
          out << "id: " + event['id'].to_s + "\n\n"
        end
      else 
        if event['id'] == last_event_id
          last_message_found == true 
        end
      end
    }

    if !last_message_found
      server_events.each { |event|
        if event['type'] == 'Message'
          out << "data: " + event['data'].to_json + "\n"
          out << "event: " + event['type'].to_s + "\n"
          out << "id: " + event['id'].to_s + "\n\n"
        end
      }
    end 
  end

  # Side effects, increments last_event_id
  def generate_encoded_id  
    last_event_id = SecureRandom.hex(10)
    return last_event_id
  end
end 