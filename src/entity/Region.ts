import { Column, Entity, Index, OneToMany } from "typeorm";
import { Category } from "./Category";
import { ProductAvailability } from "./ProductAvailability";
import { ProductPrice } from "./ProductPrice";
import { Store } from "./Store";

@Index("SYS_C007773", ["id"], { unique: true })
@Entity("REGION")
export class Region {
  @Column("varchar2", { name: "NAME", length: 50 })
  name: string;

  @Column("number", { primary: true, name: "ID", precision: 10, scale: 0 })
  id: number;

  @OneToMany(() => Category, (category) => category.region)
  categories: Category[];

  @OneToMany(
    () => ProductAvailability,
    (productAvailability) => productAvailability.region
  )
  productAvailabilities: ProductAvailability[];

  @OneToMany(() => ProductPrice, (productPrice) => productPrice.region)
  productPrices: ProductPrice[];

  @OneToMany(() => Store, (store) => store.region)
  stores: Store[];
}
