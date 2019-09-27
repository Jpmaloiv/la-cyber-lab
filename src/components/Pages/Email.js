import React from 'react'
import { Animated, Clipboard, Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
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
            <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
                <Image source={item.src} style={{ marginBottom: 5 }} />
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: '#707992', fontSize: 20, fontWeight: 'bold', marginVertical: 10 }}>STEP {index + 1}</Text>
                    <Text style={{ maxWidth: '70%', textAlign: 'center', fontSize: 15, lineHeight: 20 }}>{item.desc}</Text>
                </View>
            </ScrollView>
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
                desc: 'User forwards suspicious email to LA Cyber Lab'
            },
            {
                src: require('../../../assets/images/how-it-works_2.png'),
                desc: 'User-submitted emails will be checked for known malicious content'
            },
            {
                src: require('../../../assets/images/how-it-works_3.png'),
                desc: 'User will receive a response about their email'

            }
        ]

        return (
            <ScrollView contentContainerStyle={{ flex: 1 }}>
                <View style={[style.header, { alignItems: 'center', marginBottom: 0 }]}>
                    <Text style={style.h6}>Submit your emails to:</Text>
                    <Text style={style.h3}>{email}</Text>

                    <AnimatedButton
                        style={[style.buttonPadded, style.animatedButton, { backgroundColor, paddingBottom: 0, marginBottom: 0 }]}
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
                <View style={[style.body, { flex: 1, backgroundColor: '#1f243f', alignItems: 'center', marginTop: 0, paddingBottom: 0 }]}>
                    <Text style={[style.h2, { marginBottom: 15 }]}>HOW IT WORKS</Text>
                    <Carousel
                        ref={ref => this.carouselRef = ref}
                        data={entries}
                        renderItem={this.renderItem}
                        sliderWidth={this.state.sliderWidth}
                        onSnapToItem={index => this.setState({ activeSlide: index })}
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
                        containerStyle={{ paddingVertical: 15, backgroundColor: '#1f243f' }}
                        dotContainerStyle={{ marginHorizontal: 2 }}
                        tappableDots={!!this.carouselRef}
                        carouselRef={this.carouselRef}
                        inactiveDotStyle={{ backgroundColor: '#575a6f' }}
                        inactiveDotScale={1}
                        inactiveDotOpacity={1}
                    />
                </View>
            </ScrollView>
        )
    }
}