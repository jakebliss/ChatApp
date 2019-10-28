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
            console.log(this)
            if (this.readyState != 4) return;
            if (this.status === 201) {
              password = "";
              username = "";
              url = "";
              sessionStorage.accessToken = JSON.parse(this.responseText).token;
              console.log("TOKEN: " + sessionStorage.accessToken)
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
          this.setState({
            loggedInStatus: "you are logged in",
            user: sessionStorage.username,
            action: "Log out",
          });
        }

        const send_message = (message) => {
          console.log("SENDING: ", message);
        }

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
              text={message.text}
            />]
         });
        }

        const display_users = (users) => {
          console.log("Displaying", users)
          this.setState({
            users: users
          });
        }

      
        //opens a new stream to listen for SSE events
        const open_stream = () => {
          this.setState({
              showLogin: false
          })
          stream = new EventSource(
            sessionStorage.url + "/stream/" + sessionStorage.accessToken
          );
      
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
          )

          stream.addEventListener(
            "Join",
            function(event) {
              var data = JSON.parse(event.data);
              console.log("Join: ", data.user);
              //display_users([...this.state.users, data.user]);
              //output({
               // user: data.user,
               // time: data.created,
               // text: "JOINED",
               // }
             // )
            }
          )

          stream.addEventListener(
            "Message",
            function(event) {        
              var data = JSON.parse(event.data); 
              console.log("Message: ", data);     
              output(data);
            }
          )

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
              output()
            }
          )

          stream.addEventListener(
            "Users",
            function(event) {
              console.log("WHATS UP: ", event)
              var data = JSON.parse(event.data);
              console.log("Users: ", data.users);
              connect();
              display_users(data.users);
            }
          )

          stream.addEventListener(
            "Part",
            function(event) {
              var data = JSON.parse(event.data);
              console.log("Part: ", data);
              var new_users = this.state.users.filter((value, index, arr) => {
                return value != event.data.user;
              })
              display_users(new_users);
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

