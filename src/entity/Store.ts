import {
  Column,
  Entity, Generated,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany, PrimaryGeneratedColumn,
} from "typeorm";
import { ProductAvailability } from "./ProductAvailability";
import { ProductPrice } from "./ProductPrice";
import { Region } from "./Region";

@Entity("STORE")
export class Store {
  @Column("varchar2", { name: "PHONE", length: 40 })
  phone: string;

  @Column("varchar2", { name: "OPENING_HOURS", length: 250})
  openingHours: string;

  @Column("number", { name: "REGION_ID", precision: 10, scale: 0 })
  regionId: number;

  @Column("varchar2", { name: "ADDRESS", length: 255 })
  address: string;

  @Column("varchar2", { name: "PICTURE", nullable: true, length: 200 })
  picture: string | null;

  @PrimaryGeneratedColumn( { name: "ID" })
  id: number;

  @Column({ type: 'long', name: "PROMOTIONS"})
  promotions: string;

  @Column("number", {
    name: "LATITUDE",
    nullable: true,
    precision: 9,
    scale: 6,
  })
  latitude: number | null;

  @Column("number", {
    name: "LONGITUDE",
    nullable: true,
    precision: 9,
    scale: 6,
  })
  longitude: number | null;

  @Column("number", {
    name: "SORT",
    precision: 6,
    scale: 0,
    default: () => "0",
  })
  sort: number;

  @Column("varchar2", { name: "NAME", length: 255 })
  name: string;

  @OneToMany(
    () => ProductAvailability,
    (productAvailability) => productAvailability.store
  )
  productAvailabilities: ProductAvailability[];

  @OneToMany(() => ProductPrice, (productPrice) => productPrice.store)
  productPrices: ProductPrice[];

  @ManyToOne(() => Region, (region) => region.stores, { onDelete: "CASCADE" })
  @JoinColumn([{ name: "REGION_ID", referencedColumnName: "id" }])
  region: Region;
}
