require 'sinatra'

require 'thin'
require 'json'
require 'jwt'

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
      token = generate_JWT(password)
        response = {}
        response['token'] = token

        users[username] = create_new_user(password, token)
        puts users
        [201, {}, response.to_json]
    else   
      if user['password'] == password
        token = generate_JWT(password)
        response = {}
        response['token'] = token

        users[username]['token'] = token
        puts users
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
  decoded_token = decode_JWT(params[:signed_token])
  if decoded_token == nil 
    [403, []]
  else 
    stream(:keep_open) do |out|
      connections << out 
      out << "data: Welcome!\n\n"
      out.callback {connections.delete(out)}
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

  def generate_JWT(secret_key)
    payload = {}
    token = JWT.encode payload, secret_key, 'HS256'
    return token
  end

  def decode_JWT(token)
    if token != nil && token.start_with?('Bearer ')
      begin
        if token.split(' ')[1].split('.').length == 3
          decoded_token = JWT.decode token.split(' ')[1], ENV['JWT_SECRET'], true, { algorithm: 'HS256' }
          return decoded_token
        else
          return nil
        end
        rescue
          return nil
        end
    else
      return nil
    end
  end
end 