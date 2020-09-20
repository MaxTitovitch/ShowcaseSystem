import { Column, Entity, Index } from "typeorm";

@Index("SYS_C007770", ["id"], { unique: true })
@Entity("PROMOTION")
export class Promotion {
  @Column("date", { name: "ENDING", nullable: true })
  ending: Date | null;

  @Column("varchar2", { name: "TERMS", length: 4000 })
  terms: string;

  @Column("varchar2", { name: "PICTURE_BIG", nullable: true, length: 200 })
  pictureBig: string | null;

  @Column("varchar2", { name: "TITLE", length: 255 })
  title: string;

  @Column("number", {
    name: "MEDIUM_SHOW",
    precision: 1,
    scale: 0,
    default: () => "0",
  })
  mediumShow: number;

  @Column("number", {
    name: "SMALL_SHOW",
    precision: 1,
    scale: 0,
    default: () => "0",
  })
  smallShow: number;

  @Column("varchar2", { name: "PICTURE_SMALL", length: 200 })
  pictureSmall: string;

  @Column("varchar2", { primary: true, name: "ID", length: 50 })
  id: string;

  @Column("number", {
    name: "BIG_SHOW",
    precision: 1,
    scale: 0,
    default: () => "0",
  })
  bigShow: number;

  @Column("varchar2", { name: "PICTURE_MEDIUM", nullable: true, length: 200 })
  pictureMedium: string | null;

  @Column("date", { name: "STARTING", nullable: true })
  starting: Date | null;
}
