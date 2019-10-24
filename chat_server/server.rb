require 'sinatra'
require 'sinatra/cross_origin'
require 'thin'
require 'json'
require 'jwt'
require 'securerandom'

ENV['JWT_SECRET'] = "notasecret"

set :server, :thin
set :connections, {}
set :users, {}
set :server_events, []
set :bind, '0.0.0.0'

$server_started = false

configure do
  enable :cross_origin
end
  
before do
  response.headers['Access-Control-Allow-Origin'] = '*'
end
  
# routes...
options "*" do
  response.headers["Allow"] = "GET, PUT, POST, DELETE, OPTIONS"
  response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type, Accept, X-User-Email, X-Auth-Token"
  response.headers["Access-Control-Allow-Origin"] = "*"
  200
end

post '/login' do 
  if !$server_started 
    server_status_sse("Server Started")
    $server_started = true
  end

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

        response_headers = {} 
        response_headers["keep-alive"] = 'timeout=600'
        [201, response_headers, response.to_json]
    else   
      if user['password'] == password
        token = generate_JWT(username)
        response = {}
        response['token'] = token

        users[username]['token'] = token
        [201, {}, response.to_json]
      else 
      [403, []]
      end
    end 
  end 
end

post '/message' do 
  status = 201
  message = params[:message]
  if message == ""
    status = 422
    event = []
  end
  event = []
  token = request.env["HTTP_AUTHORIZATION"]

  response_headers = {} 

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
  if status == 201
    response_headers["keep-alive"] = 'timeout=600'
    message_sse(message, find_user(token.split(' ')[1], users))
  end
  [status, response_headers, event]
end

get '/stream/:signed_token' do
  token = params[:signed_token]
  decoded_token = decode_JWT(token)
  username = decoded_token[0]['data']
  if decoded_token == nil || users[username] == nil
    [403, []]
  else
    join_sse(username)
    existing_out = connections[token]

    if existing_out != nil
      disconnect_sse(token, username)
    end 

    response_headers = {} 
    response_headers["Content-Type"] = 'text/event-stream'
    response_headers["keep-alive"] = 'timeout=600'

    [200, response_headers, 
      stream(:keep_open) do |out|
        connections[token] = out
        
        connections.reject! {|token, out| out.closed?}

        last_event_id = request.env['HTTP_LAST_EVENT_ID']
        
        #get_missed_messages(last_event_id, token)
        # if last_event_id == nil
        # else 
        get_missed_messages(last_event_id, token)
        # end
        users_sse(token)
        out.callback { disconnect_sse(token, username) }
      end
    ]
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
        user_exists = key
      end 
    }
    return user_exists
  end

  # TODO: Figure out how to generate IDs for SSE events 
  # TODO: Time might be slightly off

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
          last_message_found = true 
        end
      end
    }

    if !last_message_found
      get_old_messages_status(token)
    end 
  end

  # Side effects, increments last_event_id
  def generate_encoded_id  
    last_event_id = SecureRandom.hex(10)
    return last_event_id
  end
end 

