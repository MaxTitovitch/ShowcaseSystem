import { Column, Entity, Index } from "typeorm";

@Index("SYS_C007834", ["id"], { unique: true })
@Entity("ADMIN")
export class Admin {
  @Column("varchar2", { name: "LOGIN", length: 50 })
  login: string;

  @Column("number", { primary: true, name: "ID", precision: 10, scale: 0 })
  id: number;

  @Column("varchar2", { name: "PASSWORD", length: 50 })
  password: string;
}
