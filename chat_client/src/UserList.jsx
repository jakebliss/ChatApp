import React from 'react';
import styled from 'styled-components'
import {
    PRIMARY_BACKGROUND,
    BORDER_RADIUS,
    BORDER_BOTTOM_HEADER,
    HEADER_FONT_SIZE,
    HEADER_FONT_COLOR,
    LOGIN_PADDING,
    LIST_FONT_COLOR,
    BODY_FONT_SIZE,
} from './styles'

export default class UserList extends React.Component {
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
            users = ["No one else is logged in yet"] 
        } = this.props;

        const users_list = users.map((user) => 
            <Users>
                {user}
            </Users>
        );
        return(
            <Background
                style={{
                    height: this.state.height * .70,
                    width: this.state.width * .20,
                }}>
                <Header>
                    Active Users
                </Header>
                { users_list }
            </Background>
        )
    }
}

const Background = styled.div`
    background: ${PRIMARY_BACKGROUND};
    border-radius: ${BORDER_RADIUS};
    padding: ${LOGIN_PADDING};
    height: "100%";
    box-shadow: 0px 3px 10px rgba(0,0,0,0.9);
    overflow-y: auto;
`;

const Header = styled.h1`
    border-bottom: ${BORDER_BOTTOM_HEADER};
    font-size: ${HEADER_FONT_SIZE};
    color: ${HEADER_FONT_COLOR};
    padding: ${LOGIN_PADDING};
    height: "100%";
`;

const Users = styled.p`
    color: ${LIST_FONT_COLOR};
    font-size: ${BODY_FONT_SIZE};
    height: "100%";
`;