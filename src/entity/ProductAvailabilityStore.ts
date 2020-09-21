import {Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import { Product } from "./Product";
import { Store } from "./Store";


@Index("PRODUCT_AVAILABILITY_STORE_UNIQUE_ID", ["productId", "storeId"], { unique: true })
@Entity("PRODUCT_AVAILABILITY_STORE")
export class ProductAvailabilityStore {

  @PrimaryGeneratedColumn( { name: "ID" })
  id: number;

  @Column("number", { name: "AVAILABILITY", precision: 1, scale: 0 })
  availability: number;

  @Column("varchar2", {
    // primary: true,
    name: "PRODUCT_ID",
    // unique: true,
    length: 50,
  })
  productId: string;

  @Column("number", {
    // primary: true,
    name: "STORE_ID",
    // unique: true,
    precision: 10,
    scale: 0,
  })
  storeId: number;

  @Column("number", {
    name: "QUANTITY",
    nullable: true,
    precision: 14,
    scale: 3,
  })
  quantity: number | null;

  @ManyToOne(() => Product, (product) => product.productAvailabilities, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "PRODUCT_ID", referencedColumnName: "article" }])
  product: Product;

  @ManyToOne(() => Store, (store) => store.productAvailabilities, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "STORE_ID", referencedColumnName: "id" }])
  store: Store;
}
