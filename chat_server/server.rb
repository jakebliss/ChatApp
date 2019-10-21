require 'sinatra'
require 'digest'

get '/' do 
 "Hello World\n"
end 

post '/login' do 

end 

post '/:message' do 

end

get '/stream/:signed_token' do 

end  
