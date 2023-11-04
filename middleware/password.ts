// import * as bcrypt from 'bcrypt';
const saltRounds = 12;

type PasswordProps = {
  password: string | null,
  hash?: string
}

class Password {
  password: string | null;
  hash?: string;

  constructor(props: PasswordProps) {
    this.password = props.password;
    this.hash = props.hash;
  }



  encrypt = async (): Promise<string | null> => {
    var hash = this.password;
    // var hash = await bcrypt.hash(this.password, saltRounds).then((hash) => {
    //   console.log('Hash: ', hash);
    //   return hash;
    // }).catch(error => console.error(error.message));

    return hash ?? null;
  };

  validate = async (): Promise<boolean> => {
    var isValid = (this.password == this.hash);
    // var isValid = await bcrypt.compare(this.password, this.hash ?? '').then((res) => {
    //   console.log(res, this.hash);
    //   return res;
    // }).catch(error => console.error(error.message));

    return isValid ?? false;
  }
}

export default Password;