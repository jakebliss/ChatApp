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
        console.log(event)
    }

    handleUsernameChange(event) {
        //Submit button
        console.log(event)
    }

    handlePasswordChange(event) {
        //Submit button
        console.log(event)
    }

    handleURLChange(event) {
        console.log(event)
    }


    render() {
        return (
            <Dim
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
                            <Form.Control onChange={this.handleURLChange} type="email" placeholder="" />
                        </Form.Group>

                        <Form.Group controlId="formBasicEmail">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control onChange={this.handleUsernameChange} type="email" placeholder="Enter email" />
                        </Form.Group>

                        <Form.Group controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control onChange={this.handlePasswordChange} type="password" placeholder="Password" />
                        </Form.Group>
                        <button onClick={this.handleLogin} type="button" class="btn btn-outline-primary">Submit</button>
                    </Form>
                </Background>
            </Dim>
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

const Entry  = styled.div`
    font-size: ${BODY_FONT_SIZE};
`;

const Dim = styled.div`

`;