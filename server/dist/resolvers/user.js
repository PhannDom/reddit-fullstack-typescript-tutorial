"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const User_1 = require("../entities/User");
const type_graphql_1 = require("type-graphql");
const argon2_1 = __importDefault(require("argon2"));
const UserMutationResponse_1 = require("../types/UserMutationResponse");
const RegisterInput_1 = require("../types/RegisterInput");
const validateRegisterInput_1 = require("../utils/validateRegisterInput");
const LoginInput_1 = require("../types/LoginInput");
const constants_1 = require("../constants");
const ForgotPasswordInput_1 = require("../types/ForgotPasswordInput");
const sendEmail_1 = require("../utils/sendEmail");
const uuid_1 = require("uuid");
const Token_1 = require("../models/Token");
let UserResolver = class UserResolver {
    me({ req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId)
                return null;
            const user = yield User_1.User.findOne(req.session.userId);
            return user;
        });
    }
    register(registerInput, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const validateRegisterInputErrors = (0, validateRegisterInput_1.validateRegisterInput)(registerInput);
            if (validateRegisterInputErrors !== null)
                return Object.assign({ code: 400, success: false }, validateRegisterInputErrors);
            try {
                const { username, email, password } = registerInput;
                const existingUser = yield User_1.User.findOne({
                    where: [{ username }, { email }]
                });
                if (existingUser)
                    return {
                        code: 400,
                        success: false,
                        message: 'Duplicated username or email',
                        errors: [
                            {
                                field: existingUser.username === username ? 'username' : 'email',
                                message: `${existingUser.username === username ? 'Username' : 'Email'} already taken`
                            }
                        ]
                    };
                const hashedPassword = yield argon2_1.default.hash(password);
                const newUser = User_1.User.create({
                    username,
                    password: hashedPassword,
                    email
                });
                yield newUser.save();
                req.session.userId = newUser.id;
                return {
                    code: 200,
                    success: true,
                    message: 'User registration successful',
                    user: newUser
                };
            }
            catch (error) {
                console.log(error);
                return {
                    code: 500,
                    success: false,
                    message: `Internal server error ${error.message}`
                };
            }
        });
    }
    login({ usernameOrEmail, password }, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingUser = yield User_1.User.findOne(usernameOrEmail.includes('@')
                    ? { email: usernameOrEmail }
                    : { username: usernameOrEmail });
                if (!existingUser)
                    return {
                        code: 400,
                        success: false,
                        message: 'User not found',
                        errors: [
                            { field: 'usernameOrEmail', message: 'Username or email incorrect' }
                        ]
                    };
                const passwordValid = yield argon2_1.default.verify(existingUser.password, password);
                if (!passwordValid)
                    return {
                        code: 400,
                        success: false,
                        message: 'Wrong password',
                        errors: [{ field: 'password', message: 'Wrong password' }]
                    };
                req.session.userId = existingUser.id;
                return {
                    code: 200,
                    success: true,
                    message: 'Logged in successfully',
                    user: existingUser
                };
            }
            catch (error) {
                console.log(error);
                return {
                    code: 500,
                    success: false,
                    message: `Internal server error ${error.message}`
                };
            }
        });
    }
    logout({ req, res }) {
        return new Promise((resolve, _reject) => {
            res.clearCookie(constants_1.COOKIE_NAME);
            req.session.destroy(error => {
                if (error) {
                    console.log('DESTROYING SESSION ERROR', error);
                    resolve(false);
                }
                resolve(true);
            });
        });
    }
    forgotPassword(forgotPasswordInput) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.User.findOne({ email: forgotPasswordInput.email });
            if (!user)
                return true;
            yield Token_1.TokenModel.findOneAndDelete({ userId: `${user.id}` });
            const resetToken = (0, uuid_1.v4)();
            const hashedResetToken = yield argon2_1.default.hash(resetToken);
            yield new Token_1.TokenModel({
                userId: `${user.id}`,
                token: hashedResetToken
            }).save();
            yield (0, sendEmail_1.sendEmail)(forgotPasswordInput.email, `<a href="http://localhost:3000/change-password?token=${resetToken}&userId=${user.id}">Click here to reset your password</a>`);
            return true;
        });
    }
};
__decorate([
    (0, type_graphql_1.Query)(_return => User_1.User, { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "me", null);
__decorate([
    (0, type_graphql_1.Mutation)(_return => UserMutationResponse_1.UserMutationResponse),
    __param(0, (0, type_graphql_1.Arg)('registerInput')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterInput_1.RegisterInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    (0, type_graphql_1.Mutation)(_return => UserMutationResponse_1.UserMutationResponse),
    __param(0, (0, type_graphql_1.Arg)('loginInput')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginInput_1.LoginInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    (0, type_graphql_1.Mutation)(_return => Boolean),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "logout", null);
__decorate([
    (0, type_graphql_1.Mutation)(_return => Boolean),
    __param(0, (0, type_graphql_1.Arg)('forgotPasswordInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ForgotPasswordInput_1.ForgotPasswordInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "forgotPassword", null);
UserResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=user.js.map