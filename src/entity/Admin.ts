import {Column, Entity, Index, PrimaryGeneratedColumn} from "typeorm";

@Entity("ADMIN")
export class Admin {
  @PrimaryGeneratedColumn( { name: "ID" })
  id: number;

  @Column("varchar2", { name: "LOGIN", length: 50 })
  login: string;

  @Column("varchar2", { name: "PASSWORD", length: 128 })
  password: string;
}
