export default class User {
  constructor({
    id = null,
    firstName = "",
    lastName = "",
    maidenName = "",
    age = 0,
    gender = "",
    email = "",
    phone = "",
    username = "",
    password = "",
    birthDate = "",
    image = "",
    bloodGroup = "",
    height = 0,
    weight = 0,
    eyeColor = "",
    hair = {},
    ip = "",
    address = {},
    macAddress = "",
    university = "",
    bank = {},
    company = {},
    ein = "",
    ssn = "",
    userAgent = "",
    crypto = {},
    role = "user"
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.maidenName = maidenName;
    this.age = age;
    this.gender = gender;
    this.email = email;
    this.phone = phone;
    this.username = username;
    this.password = password;
    this.birthDate = birthDate;
    this.image = image;
    this.bloodGroup = bloodGroup;
    this.height = height;
    this.weight = weight;
    this.eyeColor = eyeColor;
    this.hair = hair;
    this.ip = ip;
    this.address = address;
    this.macAddress = macAddress;
    this.university = university;
    this.bank = bank;
    this.company = company;
    this.ein = ein;
    this.ssn = ssn;
    this.userAgent = userAgent;
    this.crypto = crypto;
    this.role = role;
  }

  static fromJSON(json = {}) {
    return new User(json);
  }

  toJSON() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      maidenName: this.maidenName,
      age: this.age,
      gender: this.gender,
      email: this.email,
      phone: this.phone,
      username: this.username,
      password: this.password,
      birthDate: this.birthDate,
      image: this.image,
      bloodGroup: this.bloodGroup,
      height: this.height,
      weight: this.weight,
      eyeColor: this.eyeColor,
      hair: this.hair,
      ip: this.ip,
      address: this.address,
      macAddress: this.macAddress,
      university: this.university,
      bank: this.bank,
      company: this.company,
      ein: this.ein,
      ssn: this.ssn,
      userAgent: this.userAgent,
      crypto: this.crypto,
      role: this.role
    };
  }
}
