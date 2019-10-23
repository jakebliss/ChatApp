import React from 'react';
import {
    PRIMARY_BACKGROUND,
    BORDER_RADIUS,
    BORDER_BOTTOM_HEADER,
    HEADER_FONT_SIZE,
    BODY_FONT_SIZE,
    HEADER_FONT_COLOR,
    LOGIN_PADDING,
    LIST_FONT_COLOR,
} from './styles'
import styled from 'styled-components'

export default class MessageList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //State
        }
    }
    
    render() {
        const {
            messages
        } = this.props;
        const messages_list = messages.map((message) => 
            <Messages>
                {message}
            </Messages>
        )
        return(
            <Background>
                <Header>
                    Messages
                </Header>
                <div>
                { messages_list }
                </div>

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

const Messages = styled.p`
    color: ${LIST_FONT_COLOR};
    font-size: ${BODY_FONT_SIZE};
`;