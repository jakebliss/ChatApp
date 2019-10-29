import React from 'react';
import styled from 'styled-components'
import {
    PRIMARY_BACKGROUND,
    BORDER_RADIUS,
    BORDER_BOTTOM_HEADER,
    HEADER_FONT_SIZE,
    HEADER_FONT_COLOR,
    LOGIN_PADDING,
} from './styles'
import Form from "react-bootstrap/Form";
import './App.css';

export default class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userName: 'enter username',
            passWord: 'enter password',
            url: 'enter url',
            width: 0,
            height: 0,
            showLogin: 1,
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

    handleLogin() {
        this.props.loginHandler(
            this.state.url, 
            this.state.userName, 
            this.state.passWord
        );
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
                            <Form.Label className="login-form">Chat URL</Form.Label>
                            <Form.Control onChange={this.handleURLChange}  placeholder={this.state.url} />
                        </Form.Group>

                        <Form.Group controlId="formBasicEmail">
                            <Form.Label className="login-form"> Username </Form.Label>
                            <Form.Control onChange={this.handleUsernameChange} placeholder={this.state.userName} />
                        </Form.Group>

                        <Form.Group controlId="formBasicPassword">
                            <Form.Label className="login-form">Password</Form.Label>
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
    box-shadow: 0px 3px 10px rgba(0,0,0,0.9);
`;

const Header = styled.h1`
    border-bottom: ${BORDER_BOTTOM_HEADER};
    font-size: ${HEADER_FONT_SIZE};
    color: ${HEADER_FONT_COLOR};
    padding: ${LOGIN_PADDING};
`;