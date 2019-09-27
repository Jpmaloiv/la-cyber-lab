
import { StyleSheet } from 'react-native';


export default StyleSheet.create({
    app: {
        flex: 1,
        backgroundColor: '#1f243f',
        color: '#fff'
    },
    header: {
        // paddingTop: 70,
        paddingHorizontal: 25,
        paddingBottom: 30,
        backgroundColor: '#232947',
    },
    body: {
        padding: 25,
        // justifyContent: 'center',
        color: '#fff'
    },

    h1: { fontSize: 30, fontWeight: 'bold' },
    h2: { fontSize: 25, fontWeight: 'bold' },
    h3: { fontSize: 20, fontWeight: 'bold' },
    h4: { fontSize: 20, color: '#babbc3' },
    h5: { fontSize: 15, fontWeight: '500', color: '#707992' },
    h6: { fontSize: 15, opacity: 0.8 },
    h7: { fontSize: 13, opacity: 0.8 },

    p: {
        fontSize: 15,
        fontWeight: '500'
    },

    /* Input styles */
    label: {
        fontSize: 14,
        color: '#fff',
        marginHorizontal: 10,
        marginVertical: 2,
        textAlign: 'left',
        alignSelf: 'stretch'
    },
    textInput: {
        fontSize: 16,
        height: 40,
        alignSelf: 'stretch',
        padding: 5,
        color: '#fff',
        marginHorizontal: 15,
        marginVertical: 10
    },
    phoneInput: {
        fontSize: 30,
        color: '#fff'
    },

    /* Buttons */
    button: {
        width: 171,
        height: 34,
        backgroundColor: '#fa4969',
        borderRadius: 5,
        margin: 20
    },

    buttonPadded: {
        paddingHorizontal: 15,
        height: 34,
        backgroundColor: '#fa4969',
        borderRadius: 5,
        margin: 20
    },

    animatedButton: {
        justifyContent: 'center',
        alignItems: 'center',
        fontWeight: 'bold'
    },

    tile: {
        margin: 25,
        backgroundColor: '#0f2940'
    },


    /* Maps - Custom Markers */
    circleCritical: {
        width: 10,
        height: 10,
        borderRadius: 50 / 2,
        zIndex: 200,
        borderWidth: 1,
        borderColor: '#fff',
        backgroundColor: '#fa4969',
    },
    circleCriticalMax: {
        width: 25,
        height: 25,
        borderRadius: 50 / 2,
        zIndex: 200,
        borderWidth: 1,
        borderColor: '#fff',
        backgroundColor: '#fa4969',
    },
    circleGuarded: {
        width: 10,
        height: 10,
        // zIndex: 200,
        alignSelf: 'center',
        borderRadius: 30 / 2,
        borderWidth: 1,
        borderColor: '#fff',
        backgroundColor: '#faf549',
    },
    circleGuardedMax: {
        width: 25,
        height: 25,
        // zIndex: 200,
        alignSelf: 'center',
        borderRadius: 30 / 2,
        borderWidth: 1,
        borderColor: '#fff',
        backgroundColor: '#faf549',
    },
    auraCritical: {
        backgroundColor: 'rgba(255,0,0,.1)',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        width: 90,
        height: 90,
        marginBottom: 10,
    },
    auraGuarded: {
        backgroundColor: 'rgba(250,245,73,.1)',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        width: 90,
        height: 90,
        marginBottom: 10,
    },
});