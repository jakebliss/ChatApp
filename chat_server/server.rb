require 'sinatra'

require 'thin'
require 'json'
require 'jwt'

ENV['JWT_SECRET'] = "notasecret"

set :server, :thin
connections = []
users = {}

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

helpers do
  def generate_JWT(secret_key)
    payload = {}
    token = JWT.encode payload, secret_key, 'HS256'
    return token
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
 decoded_token = decode_JWT(params[:signed_token])
  if decoded_token == nil 
    [403, []]
  else 
    stream(:keep_open) do |out|
      connections << out 
      out << "data: Welcome!\n\n"
      # disconnect(out)
      # out.callback {connections.delete(out)}
      connections.reject!(&:closed?)
    end 
  end
end  

helpers do
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

  def disconnect(out)
    data = {} 
    data['created'] = Time.new(1993, 02, 24, 12, 0, 0, "+09:00").to_i

    out << "data: " + data.to_json + "\n"
    out << "event: " + "Disconnect\n"
    out << "id: " + "tempID\n\n"

    out.close
  end
end 
