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

export default class Message extends React.Component {
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
    
    date_format(timestamp) {
        var date = new Date(timestamp * 1000);
        return (
            date.toLocaleDateString("en-US") +
            " " +
            date.toLocaleTimeString("en-US")
        );
    }

    render() {
        const {
            time = 0,
            user = 0,
            text = 0,
        } = this.props;
        return(
            <Container>
                <User> {user} </User>
                <Time> {this.date_format(time)} </Time>
                <Text> {text} </Text>
            </Container>
        );
    }
}

const Container = styled.div`
    display: flex;
    flex-direction: row;
`;

const User = styled.p`
    border-left: ${BORDER_BOTTOM_HEADER};
    font-size: ${BODY_FONT_SIZE};
    color: ${HEADER_FONT_COLOR};
    padding: ${LOGIN_PADDING};
    font-weight: bold;
`;

const Time = styled.p`
    color: ${LIST_FONT_COLOR};
    font-size: ${BODY_FONT_SIZE};
    padding: ${LOGIN_PADDING};
    font-style: italic;
`;

const Text = styled.p`
    color: ${LIST_FONT_COLOR};
    font-size: ${BODY_FONT_SIZE};
    padding: ${LOGIN_PADDING};
`;