import React from 'react';
import {
    HEADER_FONT_COLOR,
    GREETING_FONT_SIZE,
    GREETING_FONT_COLOR_LOGGED_IN,
    GREETING_FONT_COLOR_LOGGED_OUT,
} from './styles'
import styled from 'styled-components'
var status_color = GREETING_FONT_COLOR_LOGGED_OUT

export default class Greeting extends React.Component {
    constructor(props) {
        super(props);
        this.state = { width: 0, height: 0 };
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

    render() {
        const {
            user,
            status,
            logout,
            login,
            action,
        } = this.props;
        return(
            <Container>
                {
                    (status === "you are logged in") ?
                    <HeaderLoggedIn>Hello, {user} {status}</HeaderLoggedIn>
                    : <HeaderLoggedOut>Hello, {status}</HeaderLoggedOut>
                }
                {
                    <HeaderDisconnect onClick={(action === "Log in") ? login : logout}>
                        {action}
                    </HeaderDisconnect>
                }
            </Container>
        );
    }
}
const HeaderDisconnect = styled.h1`
    padding-left: 10px;
    font-size: ${GREETING_FONT_SIZE};
    color: ${GREETING_FONT_COLOR_LOGGED_IN};
    &:hover {
        cursor: pointer;
    };
`;

const Container = styled.div`
    display: flex;
    flex-direction: row;
`;

const HeaderLoggedIn = styled.h1`
    border-left: ${GREETING_FONT_COLOR_LOGGED_IN};
    font-size: ${GREETING_FONT_SIZE};
    color: ${HEADER_FONT_COLOR};
    padding-left: 10px;
`;

const HeaderLoggedOut = styled.h1`
    border-left: ${GREETING_FONT_COLOR_LOGGED_OUT};
    font-size: ${GREETING_FONT_SIZE};
    color: ${HEADER_FONT_COLOR};
    padding-left: 10px;
`;