import React from 'react';
import styled from 'styled-components'
import {
    PRIMARY_BACKGROUND,
    BORDER_RADIUS,
    BORDER_BOTTOM_HEADER,
    HEADER_FONT_SIZE,
    BODY_FONT_SIZE,
    HEADER_FONT_COLOR,
    LOGIN_PADDING,
} from './styles'
import Form from "react-bootstrap/Form";
import './App.css';

export default class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userName: 'Jake',
            passWord: '123',
            url: 'localhost',
            width: 0,
            height: 0,
        }

        this.handleLogin = this.handleLogin.bind(this);
        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleURLChange = this.handleURLChange.bind(this);
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
    }
      
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }
      
    updateWindowDimensions() {
        this.setState({ width: window.innerWidth, height: window.innerHeight });
    }

    handleLogin(event) {
        //Submit button
        console.log(this.state.userName);
        console.log(this.state.passWord);
        console.log(this.state.url);
        var request = new XMLHttpRequest();
        var form = new FormData();
        var password = this.state.passWord
        var username = this.state.userName
        var url = this.state.url
        form.append("password", password);
        form.append("password", username);
        sessionStorage.url = url;
        console.log("URL:" + sessionStorage.url);
        request.open("POST", sessionStorage.url + "/login");
        request.onreadystatechange = function() {
            console.log(this)
            if (this.readyState != 4) return;
            if (this.status === 201) {
                password = "";
                username = "";
                url = ""
                //TODO store token open stream
            } 
            else if (this.status === 403) {
                alert("Invalid username or password")
            }
            else {
                alert("failure to /login")
            }
        };
        request.send(form);
        this.setState({
            userName: username,
            password: password,
            url: url,
        })
    }

    handleUsernameChange(event) {
        this.setState({ userName: event.target.value })
    }

    handlePasswordChange(event) {
        this.setState({ passWord: event.target.value })
    }

    handleURLChange(event) {
        this.setState( {url: event.target.value} )
    }


    render() {
        return (
            <div
            style ={{
                width: window.innerWidth,
                height: window.innerHeight,
            }}>
                <Background
                    style ={{
                        width: window.innerWidth * .5,
                        position: 'absolute',
                        bottom: window.innerHeight * .4,
                        left: window.innerWidth * .2,
                    }}>
                    <Header>
                        Login
                    </Header>
                    <Form>
                        <Form.Group controlId="formBasicEmail">
                            <Form.Label>Chat URL</Form.Label>
                            <Form.Control onChange={this.handleURLChange} type="email" placeholder={this.state.url} />
                        </Form.Group>

                        <Form.Group controlId="formBasicEmail">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control onChange={this.handleUsernameChange} type="email" placeholder={this.state.userName} />
                        </Form.Group>

                        <Form.Group controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control onChange={this.handlePasswordChange} type="password" placeholder={this.state.passWord} />
                        </Form.Group>
                        <button onClick={this.handleLogin} type="button" class="btn btn-outline-primary">Submit</button>
                    </Form>
                </Background>
            </div>
        )
    }

}

const Background = styled.div`
    background: ${PRIMARY_BACKGROUND};
    border-radius: ${BORDER_RADIUS};
    padding: ${LOGIN_PADDING};
`;

const Header = styled.h1`
    border-bottom: ${BORDER_BOTTOM_HEADER};
    font-size: ${HEADER_FONT_SIZE};
    color: ${HEADER_FONT_COLOR};
    padding: ${LOGIN_PADDING};
`;