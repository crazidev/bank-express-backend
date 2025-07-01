// import * as bcrypt from 'bcrypt';
import { User } from '../models';
import Password from './password';
import { Response } from 'express';
const saltRounds = 12;

type PinProps = {
    pin: string | null,
    hash?: string,
    userId: number,
}

class Pin {
    pin: string | null;
    userId: number;


    constructor(props: PinProps) {
        this.pin = props.pin;
        this.userId = props.userId;
    }

    validate = async (): Promise<boolean> => {
        // Fetch current user
        const user = await User.findOne({
            where: {
                id: this.userId
            }
        });

        if (user?.pin == null) {
            return false;
        }

        // CHECK IF PIN MATCH
        const validatePassword = await new Password({ password: this.pin, hash: `${user!.pin}` }).validate();

        return validatePassword ?? false;
    }
}

export default Pin;