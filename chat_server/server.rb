require 'sinatra'
require 'thin'
require 'json'
require 'jwt'

post '/login' do 
  username = params[:username]
  password = params[:password]

  if username ==  "" || password == "" 
    [422, []]
  else 
    if 1==1 # TODO: Check database 
      token = generate_JWT(password)
      response = {}
      response['token'] = token
      [201, {}, response.to_json]
    else 
      [403, []]
    end
  end 

  # puts username
  # puts password
end

helpers do
  def generate_JWT(secret_key)
    payload = {}
    token = JWT.encode payload, secret_key, 'HS256'
    return token
  end
end 
