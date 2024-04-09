import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthDto } from "src/dto";
import { PrismaService } from "src/prisma/prisma.service";
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

@Injectable()
export class AuthService {

    constructor(private prisma: PrismaService) {

    }

    async signup(dto: AuthDto) {
        try{

            //generate the password hash
            const hash = await argon.hash(dto.password);
            //save the new user in the db
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash
                }, 
                select: {
                    id: true,
                    email: true,
                    createdAt: true
                }
            })
            //return the saved user
            return user;
        } catch (err) {
            if(err instanceof PrismaClientKnownRequestError) {
                if(err.code === 'P2002') {
                    throw new ForbiddenException('Credentials taken');
                }
            }
            throw err;
        }
    }

    async signin(dto: AuthDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            }
        })

        if(!user) {
            throw new ForbiddenException(
                'Credentials incorrect',
            )
        };

        const pwMatches = await argon.verify(
            user.hash, 
            dto.password,
        );

        if(!pwMatches) {
            throw new ForbiddenException(
                'Credentials incorrect',
            );
        };

        delete user.hash;
        return user;

    }
}