import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity({name: 'USER'})
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 255})
    login: string;

    @Column({length: 255})
    password: string;
}
