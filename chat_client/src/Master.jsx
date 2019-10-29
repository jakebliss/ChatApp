import React from 'react';
import Input from './Input';
import UserList from './UserList';
import LoginComponent from './LoginComponent'
import MessageList from './MessageList';
import Greeting from './Greeting';
import Message from './Message'

var EventSource = require("eventsource");
var stream = null;

export default class Master extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showLogin: true,
            loggedInStatus: "you are not logged in.",
            user: "Jake",
            action: "Log in",
            messages: [],
            users: [],
        }
    }
    
    render() {
        //Called after login is pressed in login modal
        const login = (url, username, password) => {
          console.log("Succesful Login" + url + username + password);
          var request = new XMLHttpRequest();
          var form = new FormData();
          form.append("password", password);
          form.append("username", username);
          sessionStorage.url = url;
          sessionStorage.username = username;
          console.log("URL:" + sessionStorage.url);
          request.open("POST", sessionStorage.url + "/login");
          request.onreadystatechange = function() {
            if (this.readyState != 4) return;
            if (this.status === 201) {
              password = "";
              username = "";
              url = "";
              sessionStorage.accessToken = JSON.parse(this.responseText).token;
              open_stream()
            } 
            else if (this.status === 403) {
              alert("Invalid username or password")
            }
            else {
              alert(this.status + "failure to /login")
            }
          };
          request.send(form);
        }

        //Called when a disconnect is triggered
        const disconnect = () => {
          console.log("disconnect");
          this.setState({
            loggedInStatus: "you are not logged in",
            users: [],
            action: "Log in",
            messages: [],
          });
        }

        //Called when a user is connected
        const connect = () => {
          console.log("CONNECTING")
          this.setState({
            loggedInStatus: "you are logged in",
            user: sessionStorage.username,
            action: "Log out",
          });
        }

        const send_message = (message) => {
          console.log("SENDING: ", message);
          if (sessionStorage.accessToken === undefined ){
            return;
          }
          if (message.value === "") {
            return;
          }
          var form = new FormData();
          form.append("message", message);
          var request = new XMLHttpRequest();
          request.open("POST", sessionStorage.url + "/message");
          request.setRequestHeader(
            "Authorization",
            "Bearer " + sessionStorage.accessToken
          );
          request.send(form);
        }

        //Display login modal
        const show_login = () => {
          this.setState({
            showLogin: true,
          });
        }

        //Called when a new message needs to be displayed
        const output = (message) => {
          console.log("OUTPUT: ", message)
          this.setState({
            messages: [...this.state.messages,               
            <Message 
              user={message.user} 
              time={message.created} 
              text={message.message}
            />]
         });
        }

        const display_users = (users) => {
          console.log("Displaying", users)
          this.setState({
            users: users
          });
        }

        const add_user = (user) => {
          display_users([...this.state.users, user])
        }

        const remove_user = (user) => {
          var new_users = this.state.users.filter((value, index, arr) => {
            return value != user;
          })
          display_users(new_users)
        }

      
        //opens a new stream to listen for SSE events
        const open_stream = () => {
          console.log("CALLING OPEN STREAM")
          stream = new EventSource(
            sessionStorage.url + "/stream/" + sessionStorage.accessToken
          );

          this.setState({
            showLogin: false
          })
      
          stream.addEventListener(
            "Disconnect",
            function(event) {
              var data = JSON.parse(event.data);
              console.log("Disconnect: ", data);
              stream.close();
              disconnect();
              delete sessionStorage.accessToken;
              show_login();
            }
          );

          stream.addEventListener(
            "Join",
            function(event) {
              var data
              try {
                data = JSON.parse(event.data);
                console.log("Join: ", data);
                console.log("HNNG: ", this.state)
                add_user(data.user);
                output({
                  user: data.user,
                  time: data.created,
                  message: "JOINED",
                }
              )
            }
          catch(e) {
            console.log("Too bad so sad", e)
            }
          }

          );

          stream.addEventListener(
            "Message",
            function(event) {     
              var data = JSON.parse(event.data); 
              console.log("Message: ", data);     
              output(data);
            }
          );

          stream.addEventListener(
            "Server Status",
            function(event) {
              var data = JSON.parse(event.data);
              console.log("SS: ", data);
              var message = {
                user: "Server Status",
                time: data.created,
                text: data.status,
              }
              output(message)
            }
          );

          stream.addEventListener(
            "Users",
            function(event) {
              console.log("WHATS UP:")
              var data
              try {
                data = JSON.parse(event.data);
                console.log("Users: ", data.users);
                connect();
                display_users(data.users);
              } catch(e) {
                console.log("Too bad so sad.")
              }
            }
          );

          stream.addEventListener(
            "Part",
            function(event) {
              var data = JSON.parse(event.data);
              console.log("Part: ", data);
              remove_user(data.user);
              output({
                user: data.user,
                time: data.created,
                message: "PART",
              })
            }
          );

          
          stream.addEventListener(
            "error",
            function(event) {
              console.log("Oh well", event)
            }
          )
          
        }

        return(
            <div className="App">
                {this.state.showLogin &&
                    <div className="Login">
                        <LoginComponent loginHandler = {login}/>
                    </div>
                }
                <div className="Greeting">
                  <Greeting 
                    user={this.state.user} 
                    status={this.state.loggedInStatus}
                    logout={disconnect}
                    login={show_login}
                    action={this.state.action}
                  />
                </div>
                <div className="Messages">
                    <MessageList messages={this.state.messages}/>
                </div>
                <div className="Users">
                    <UserList users={this.state.users}/>
                </div>
                <div className="Input">
                    <Input send={send_message}/>
                </div>
            </div>
        );
    }
}

