import React from 'react'
import { Animated, Clipboard, Dimensions, Image, Text, TouchableOpacity, View } from 'react-native'
import { Button } from 'react-native-elements'
import Carousel, { Pagination } from 'react-native-snap-carousel'
import Icon from 'react-native-vector-icons/Feather';
import style from '../../../style'


export default class Email extends React.Component {
    constructor() {
        super()
        this.state = {
            sliderWidth: Dimensions.get('window').width,
            activeSlide: 0,
            backgroundColor: new Animated.Value(0),
            fade1: new Animated.Value(1),
            fade2: new Animated.Value(0)
        }
    }

    renderItem({ item, index }) {
        return (
            <View style={{ alignItems: 'center' }}>
                <Image source={item.src} style={{marginBottom: 5}} />
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: '#707992', fontSize: 20, fontWeight: 'bold', marginBottom: 2 }}>STEP {index + 1}</Text>
                    <Text numberOfLines={2} style={{  textAlign: 'center', fontSize: 15, lineHeight: 20 }}>{item.desc}</Text>
                </View>
            </View>
        )
    }

    // Copies the LA Cyber Lab email to the clipboard
    copyToClipboard(email) {
        Clipboard.setString(email)

        // Button animation
        Animated.sequence([
            Animated.parallel([
                Animated.timing(this.state.backgroundColor, {
                    delay: 0,
                    duration: 0,
                    toValue: 1
                }),
                Animated.timing(this.state.backgroundColor, {
                    delay: 150,
                    duration: 400,
                    toValue: 2
                }),
                Animated.timing(this.state.fade1, {
                    duration: 300,
                    toValue: 0
                }),
                Animated.timing(this.state.fade2, {
                    duration: 300,
                    toValue: 1
                }),
            ]),
            Animated.delay(800),
            Animated.parallel([
                Animated.timing(this.state.backgroundColor, {
                    delay: 150,
                    duration: 400,
                    toValue: 0
                }),
                Animated.timing(this.state.fade1, {
                    delay: 100,
                    duration: 400,
                    toValue: 1
                }),
                Animated.timing(this.state.fade2, {
                    delay: 100,
                    duration: 400,
                    toValue: 0
                })
            ])

        ]).start();
    }


    render() {
        console.log(this.state.activeSlide)
        const email = 'gophish@lacyberlab.net'

        // Animation interpolation
        const AnimatedButton = Animated.createAnimatedComponent(TouchableOpacity);
        const backgroundColor = this.state.backgroundColor.interpolate({
            inputRange: [0, 1, 2],
            outputRange: ['#fa4969', '#fff', '#00a6f5']
        });

        const entries = [
            {
                src: require('../../../assets/images/how-it-works_1.png'),
                desc: 'Send suspicious emails to LA Cyber Lab'
            },
            {
                src: require('../../../assets/images/how-it-works_2.png'),
                desc: 'LA Cyber Lab will examine the contents of your email'
            },
            {
                src: require('../../../assets/images/how-it-works_3.png'),
                desc: 'LA Cyber Lab will send you a report about your email'

            }
        ]

        return (
            <View style={{ flex: 1 }}>
                <View style={[style.header, { alignItems: 'center',paddingTop:10,  paddingBottom:0,marginBottom:0}]}>
                    <Text style={style.h6}>Submit your emails to:</Text>
                    <Text style={style.h3}>{email}</Text>

                    <AnimatedButton
                        style={[style.button, style.animatedButton, { backgroundColor, paddingBottom:0,marginBottom:0 }]}
                        onPress={() => this.copyToClipboard(email)}
                    >
                        <Animated.View style={{ flexDirection: 'row', opacity: this.state.fade1 }}>
                            <Icon name='copy' color='#fff' size={15} style={{ marginRight: 7 }} />
                            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>COPY TO CLIPBOARD</Text>
                        </Animated.View>
                        <Animated.View style={{ flexDirection: 'row', opacity: this.state.fade2, position: 'absolute' }}>
                            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>COPIED</Text>
                            <Icon name='check' color='#fff' size={15} style={{ marginLeft: 7 }} />
                        </Animated.View>
                    </AnimatedButton>

                </View>
                <View style={[style.body, { flex: 1, alignItems: 'center', marginTop: 0 }]}>
                    <Text style={[style.h2, {marginBottom: 15}]}>HOW IT WORKS</Text>
                    <Carousel
                        ref={ref => this.carouselRef = ref}
                        data={entries}
                        renderItem={this.renderItem}
                        sliderWidth={this.state.sliderWidth}
                        onSnapToItem={index => this.setState({ activeSlide: index})}
                        itemWidth={this.state.sliderWidth}
                        // inactiveSlideOpacity={0}
                        // inactiveSlideScale={0.75}
                    />
                    </View>
                    <View>
                    <Pagination
                        dotsLength={entries.length}
                        activeDotIndex={this.state.activeSlide}
                        dotStyle={{
                            width: 7,
                            // height: 7,
                            borderRadius: 5,
                            backgroundColor: '#fa4969'
                        }}
                        dotContainerStyle={{ marginHorizontal: 2 }}
                        tappableDots={!!this.carouselRef}
                        carouselRef={this.carouselRef}
                        inactiveDotStyle={{ backgroundColor: '#575a6f' }}
                        inactiveDotScale={1}
                        inactiveDotOpacity={1}
                    />
                    </View>
            </View >
        )
    }
}