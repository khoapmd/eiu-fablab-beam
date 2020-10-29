/** 
 * @copyright    MIT Lesser General Public License
 * 
 * @author [email](khoa.pmd@outlook.com)
 * @date  2020-10-29
 */

let maqueencb: Action
let maqueenmycb: Action
let maqueene = "1"
let maqueenparam = 0
let alreadyInit = 0
let IrPressEvent = 0

enum PIN {
    P0 = 3,
    P1 = 2,
    P2 = 1,
    P8 = 18,
    //P9 = 10,
    P12 = 20,
    P13 = 23,
    P14 = 22,
    P15 = 21,
};

enum Motors {
    //% block="left"
    M1 = 1,
    //% block="right"
    M2 = 2,
    //% block="ALL"
    ALL = 3
}

enum Dir {
    //% block="rotate forward"
    CW = 1,
    //% block="backward"
    CCW = 2
}

enum Servos {
    //% block="S1"
    S1 = 1,
    //% block="S2"
    S2 = 2,
    //% block="S3"
    S3 = 3
}

enum RGBLight {
    //%block="RGB_L"
    RGBL = 1,
    //%block="RGB_R"
    RGBR = 2,
    //%block="ALL"
    RGBA = 3
}

enum Patrol {
    //% block="L1"
    L1 = 1,
    //%block="L2"
    L2 = 2,
    //%block="L3"
    L3 = 5,
    //%block="R1"
    R1 = 3,
    //%block="R2"
    R2 = 4,
    //%block="R3"
    R3 = 6
}

enum Sonicunit {
    //% block="cm"
    Centimeters
}

enum PID {
    //%block="OFF"
    OFF = 0,
    //%block="ON"
    ON = 1
}

enum Color {
    //%block="Red"
    RED = 1,
    //%block="Green"
    GREEN = 2,
    //%block="Blue"
    BLUE = 4,
    //%block="Yellow"
    YELLOW = 3,
    //%block="Violet"
    PINK = 5,
    //%block="Cyan"
    CYAN = 6,
    //%block="White"
    WHITH = 7,
    //%block="OFF"
    OFF = 8

}

//% weight=100  color=#00A654   block="Maqueen Plus" icon="\uf067"
namespace DFRobotMaqueenPlus {

    export class Packeta {
        public mye: string;
        public myparam: number;
    }
   
    /**
     *  Init I2C until success
     */
    //% weight=100
    //%block="initialize via I2C until success"
    export function I2CInit():void{
        let Version_v = 0;
        pins.i2cWriteNumber(0x10, 0x32, NumberFormat.Int8LE);
        Version_v = pins.i2cReadNumber(0x10, NumberFormat.Int8LE);
        while (Version_v==0){
            basic.showLeds(`
                # . . . #
                . # . # .
                . . # . .
                . # . # .
                # . . . #
                `, 10)
            basic.pause(500)
            basic.clearScreen()
            pins.i2cWriteNumber(0x10, 0x32, NumberFormat.Int8LE);
            Version_v = pins.i2cReadNumber(0x10, NumberFormat.Int8LE);
        }
        basic.showLeds(`
                . . . . .
                . . . . #
                . . . # .
                # . # . .
                . # . . .
                `, 10)
        basic.pause(500)
        basic.clearScreen()
    }

    /**
     * PID control module
     */
    //% weight=90
    //%block="PID switch|%pid"
    export function PID(pid: PID): void {
        let buf = pins.createBuffer(2);
        buf[0] = 0x0A;
        buf[1] = pid;
        pins.i2cWriteBuffer(0x10, buf);
    }
    /**
     * Motor control module
     */
    //% weight=80
    //% block="motor|%index|direction|%direction|speed|%speed "
    //% speed.min=0 speed.max=255
    export function mototRun(index: Motors, direction: Dir, speed: number): void {
        let _speed:number;
        if(speed >= 240) _speed=240;
        else _speed=speed;
        if (index == 1) {
            let buf = pins.createBuffer(3)
            buf[0] = 0x00;
            buf[1] = direction;
            buf[2] = _speed;
            pins.i2cWriteBuffer(0x10, buf)

        } if (index == 2) {
            let buf = pins.createBuffer(3)
            buf[0] = 0x02;
            buf[1] = direction;
            buf[2] = _speed;
            pins.i2cWriteBuffer(0x10, buf)
        }
        if (index == 3) {
            let buf = pins.createBuffer(5)
            buf[0] = 0x00;
            buf[1] = direction;
            buf[2] = _speed;
            buf[3] = direction;
            buf[4] = _speed;
            pins.i2cWriteBuffer(0x10, buf)
        }
    }
    /**
     * Motor stop module
     */
    //% weight=75
    //% block="Motor|%index stop"
    export function mototStop(index: Motors): void {

        if (index == 1) {
            let buf = pins.createBuffer(3)
            buf[0] = 0x00;
            buf[1] = 0;
            buf[2] = 0;
            pins.i2cWriteBuffer(0x10, buf)

        } if (index == 2) {
            let buf = pins.createBuffer(3)
            buf[0] = 0x02;
            buf[1] = 0;
            buf[2] = 0;
            pins.i2cWriteBuffer(0x10, buf)
        }
        if (index == 3) {
            let buf = pins.createBuffer(5)
            buf[0] = 0x00;
            buf[1] = 0;
            buf[2] = 0;
            buf[3] = 0;
            buf[4] = 0;
            pins.i2cWriteBuffer(0x10, buf)
        }
    }

    /**
     * Read line-tracking sensor status
     */
    //% weight=56
    //%block="read line-tracking sensor|%patrol"
    export function readPatrol(patrol: Patrol): number {
        pins.i2cWriteNumber(0x10, 0x1D, NumberFormat.Int8LE);
        let patrol_y = pins.i2cReadBuffer(0x10, 1);
        let mark: number ;
        switch (patrol) {
            case 1: mark = (patrol_y[0] & 0x04) == 0x04 ? 1 : 0; break;
            case 2: mark = (patrol_y[0] & 0x02) == 0x02 ? 1 : 0; break;
            case 3: mark = (patrol_y[0] & 0x08) == 0x08 ? 1 : 0; break;
            case 4: mark = (patrol_y[0] & 0x10) == 0x10 ? 1 : 0; break;
            case 5: mark = (patrol_y[0] & 0x01) == 0x01 ? 1 : 0; break;
            case 6: mark = (patrol_y[0] & 0x20) == 0x20 ? 1 : 0; break;
        }
        
        return mark
    }

    /**
     * Read grayscale value of line-tracking sensor
     */
    //% weight=55
    //% block="read line-tracking sensor|%patrol grayscale "
    export function readPatrolVoltage(patrol: Patrol): number {
        pins.i2cWriteNumber(0x10, 0x1E, NumberFormat.Int8LE);
        let patrolv_y = pins.i2cReadBuffer(0x10, 12);
        let patrol_AD: number;
        switch (patrol) {
            case 1:
                patrol_AD = patrolv_y[5] | patrolv_y[4] << 8;
                break;
            case 2:
                patrol_AD = patrolv_y[3] | patrolv_y[2] << 8;
                break;
            case 3:
                patrol_AD = patrolv_y[7] | patrolv_y[6] << 8;
                break;
            case 4:
                patrol_AD = patrolv_y[9] | patrolv_y[8] << 8;
                break;
            case 5:
                patrol_AD = patrolv_y[1] | patrolv_y[0] << 8;
                break;
            default:
                patrol_AD = patrolv_y[11] | patrolv_y[10] << 8;
                break;

        }
        return patrol_AD;
    }
    
    /**
     * Read the distance value the ultrasound returns 
     */
    //% weight=20
    //%block="read ultrasonic sensor TRIG %T ECHO %E Company:CM"
    export function ultraSonic(T: PIN, E: PIN): number {
        let maxCmDistance = 500;
        let _T;
        let _E;
        switch (T) {
            case PIN.P0: _T = DigitalPin.P0; break;
            case PIN.P1: _T = DigitalPin.P1; break;
            case PIN.P2: _T = DigitalPin.P2; break;
            case PIN.P8: _T = DigitalPin.P8; break;
            case PIN.P12: _T = DigitalPin.P12; break;
            // case PIN.P10: _T = DigitalPin.P10; break;
            case PIN.P13: _T = DigitalPin.P13; break;
            case PIN.P14: _T = DigitalPin.P14; break;
            case PIN.P15: _T = DigitalPin.P15; break;
            default: _T = DigitalPin.P0; break;
        }

        switch (E) {
            case PIN.P0: _E = DigitalPin.P0; break;
            case PIN.P1: _E = DigitalPin.P1; break;
            case PIN.P2: _E = DigitalPin.P2; break;
            case PIN.P8: _E = DigitalPin.P8; break;
            //case PIN.P9: _E = DigitalPin.P9; break;
            case PIN.P12: _E = DigitalPin.P12; break;
            case PIN.P13: _E = DigitalPin.P13; break;
            case PIN.P14: _E = DigitalPin.P14; break;
            case PIN.P15: _E = DigitalPin.P15; break;
            default: _E = DigitalPin.P0; break;
        }

        let ultraSonic_d;
        pins.digitalWritePin(_T, 0);
        if (pins.digitalReadPin(_E) == 0) {
            pins.digitalWritePin(_T, 1);
            // basic.pause(10);
            pins.digitalWritePin(_T, 0);
            ultraSonic_d = pins.pulseIn(_E, PulseValue.High, maxCmDistance * 58);
        } else {
            pins.digitalWritePin(_T, 0);
            // basic.pause(10);
            pins.digitalWritePin(_T, 1);
            ultraSonic_d = pins.pulseIn(_E, PulseValue.Low, maxCmDistance * 58);
        }
        let ultraSonic_x = ultraSonic_d / 39;
        if (ultraSonic_x <= 0 || ultraSonic_x > 500) {
            return 0;
        }
        return Math.round(ultraSonic_x);


    }

    //% advanced=true shim=maqueenIR::getParam
    function getParam(): number {
        return 0
    }

    /**
     * clear the revolutions of wheel 
     */
    //% weight=60
    //%block="clear the revolutions of wheel %motor" 
    export function clearDistance(motor:Motors):void{
        
        switch(motor){
            case 1: 
                let buf1 = pins.createBuffer(2);
                buf1[0] = 0x04;
                buf1[1] = 0;
                pins.i2cWriteBuffer(0x10, buf1);
                break;
            case 2:
                let buf2 = pins.createBuffer(2);
                buf2[0] = 0x06;
                buf2[1] = 0;
                pins.i2cWriteBuffer(0x10, buf2);
                break;
            default:
                let buf3 = pins.createBuffer(4);
                buf3[0] = 0x04;
                buf3[1] = 0;
                buf3[2] = 0;
                buf3[3] = 0;
                pins.i2cWriteBuffer(0x10, buf3);
        }
    }
}