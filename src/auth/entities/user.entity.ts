// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document } from 'mongoose';
// import validator from 'validator';
// import * as argon from 'argon2';

// export enum Role {
//   USER = 'user',
//   ADMIN = 'admin',
// }

// @Schema({ timestamps: true })
// export class User extends Document {
//   @Prop({
//     required: true,
//     maxlength: 50,
//     minlength: 2,
//   })
//   name: string;
//   @Prop({
//     required: true,
//     maxlength: 50,
//     minlength: 2,
//     unique: true,
//     validate: validator.isEmail,
//   })
//   email: string;

//   @Prop({ required: true, select: false })
//   password: string;

//   @Prop({ required: true, default: Role.USER })
//   roles: Role[];

//   comparePassword: (candidatePassword: string) => Promise<boolean>;
// }

// export const UserSchema = SchemaFactory.createForClass(User);

// UserSchema.methods.comparePassword = async function (
//   candidatePassword: string,
// ) {
//   const user = this as User;

//   return argon.verify(user.password, candidatePassword);
// };
