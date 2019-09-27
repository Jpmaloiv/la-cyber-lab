import React, { Component } from 'react';
import { Image, Text, View } from 'react-native';
import style from '../../../style'
import { Marker } from 'react-native-maps';

export default class CustomMarker extends Component {
    constructor() {
        super();
        this.state = {
            tracksViewChanges: true,
        }
    }

    circleCriticalStyle = function (myColor) {
        return {
            width: 25,
            height: 25,
            borderRadius: 50 / 2,
            borderWidth: 3,
            borderColor: '#fff',
            backgroundColor: '#fa4969',
        }
    }

    circleGuardedStyle = function (myColor) {
        return {
            width: 10,
            height: 10,
            zIndex: 1,
            alignSelf: 'center',
            borderRadius: 30 / 2,
            borderWidth: 3,
            borderColor: '#fff',
            backgroundColor: '#faf549',
        }
    }

    render() {

        let critical, max;
        if (this.props.isMaxCount) {
            max = true
        } else {
            max = false
        }

        if (this.props.type === 'critical') {
            critical = true
        } else {
            critical = false
        }

        return (
            <Marker
                coordinate={this.props.coordinate}
                tracksViewChanges={false}
                anchor={{ x: 0.5, y: 0.5 }}
                style={{ zIndex: this.props.z }}
            >
                <View style={
                    critical
                        ? max
                        ? style.circleCriticalMax
                        : style.circleCritical
                        : max
                            ? style.circleGuardedMax
                            : style.circleGuarded} />


                {/* <Image
                    source={this.props.type === 'critical' ? require('../../../assets/images/marker-critical.png') : require('../../../assets/images/marker-guarded.png')}
                    style={{width: 30, height: 30}}
                    // onLoad={this.stopRendering}
                /> */}
            </Marker >
        )
    }
}