require 'sinatra'

require 'thin'
require 'json'
require 'jwt'

ENV['JWT_SECRET'] = "notasecret"

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

  puts username
  puts params
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
  if token == ""
    status = 422
    event = []
  end
  if token.split(' ')[0] != "Bearer"
    status = 422
    event = []
  end
  begin
    token = JWT.decode token.split(' ')[1], ENV['JWT_SECRET'], true, {algorithm: 'HS256'}
  rescue JWT::VerificationError => e
    puts "Verify Error"
    status = 403
    event = []
  rescue JWT::ExpiredSignature => e
    puts "Expire Error"
    status = 403
    event = []
  rescue JWT::ImmatureSignature => e
    puts "Immature"
    status = 403
    event = []
  rescue JWT::DecodeError => e
    puts "DECODE ERROR"
    status = 403
    event = []
  end
  puts request.env["HTTP_AUTHORIZATION"]
  [status, event]
end

get '/stream/:signed_token' do 

end  
