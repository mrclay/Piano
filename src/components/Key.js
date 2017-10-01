import React from 'react';

export default class Key extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const note = this.props.note;
        const style = {};
        if (this.props.left) {
            style.left = this.props.left + 'px';
        }
        const className = this.props.active ? 'active' : '';
        return (
                <a href="#" className={className} style={style}></a>
        );
    }
}
