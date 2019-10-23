require 'sinatra'

require 'thin'
require 'json'
require 'jwt'

ENV['JWT_SECRET'] = "notasecret"

set :server, :thin
set :connections, {}
set :users, {}

post '/login' do 
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
        [201, {}, response.to_json]
    else   
      if user['password'] == password
        token = generate_JWT(password)
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

post '/:message' do 

end

get '/stream/:signed_token' do
  token = params[:signed_token]
  decoded_token = decode_JWT(token)
  if decoded_token == nil 
    [403, []]
  else 
    username = decoded_token[0]['data']
    stream(:keep_open) do |out|
      connections[token] = out
      out << "data: Welcome!\n\n"
      message("hi my name is jake", username)
      #disconnect(params[:signed_token])
      # out.callback {connections.delete(out)}
      # connections.reject!(&:closed?)
    end 
  end
end  

helpers do
  def connections; self.class.connections; end 
  def users; self.class.users; end 

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

  # TODO: Figure out how to generate IDs for SSE events 
  # TODO: Time might be slightly off

  def disconnect(token)
    out = connections[token]

    if stream != nil
      data = {} 
      data['created'] = Time.new(1993, 02, 24, 12, 0, 0, "+09:00").to_i

      out << "data: " + data.to_json + "\n"
      out << "event: " + "Disconnect\n"
      out << "id: " + "tempID\n\n"

      out.close
      connections.delete(token)
    end
  end

  def join(username) 
    data = {}
    data['user'] = username
    data['created'] = Time.new(1993, 02, 24, 12, 0, 0, "+09:00").to_i
    
    connections.each_value { |out| 
      out << "data: " + data.to_json + "\n"
      out << "event: " + "Join\n"
      out << "id: " + "tempID\n\n"
    }
  end

  def message(message, username) 
    data = {}
    data['message'] = message
    data['user'] = username
    data['created'] = Time.new(1993, 02, 24, 12, 0, 0, "+09:00").to_i
    
    connections.each_value { |out| 
      out << "data: " + data.to_json + "\n"
      out << "event: " + "Message\n"
      out << "id: " + "tempID\n\n"
    }
  end

end 