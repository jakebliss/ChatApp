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
        this.state = {
            //State
        }
    }
    render() {
        const { users } = this.props;
        const users_list = users.map((user) => 
            <Users>
                {user}
            </Users>
        );
        console.log(users)
        return(
            <Background>
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
`;

const Header = styled.h1`
    border-bottom: ${BORDER_BOTTOM_HEADER};
    font-size: ${HEADER_FONT_SIZE};
    color: ${HEADER_FONT_COLOR};
    padding: ${LOGIN_PADDING};
`;

const Users = styled.p`
    color: ${LIST_FONT_COLOR};
    font-size: ${BODY_FONT_SIZE};
`;