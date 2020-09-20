import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Category } from "./Category";
import { Product } from "./Product";

@Index("PRODUCT_TO_CATEGORY_BINDING_CATEGORY_ID_IDX", ["categoryId"], {})
@Index("PRODUCT_TO_CATEGORY_BINDING_PRODUCT_ID_IDX", ["productId"], {})
@Index("PRODUCT_TO_CATEGORY_UNIQUE", ["categoryId", "productId"], { unique: true })
@Entity("PRODUCT_TO_CATEGORY_BINDING")
export class ProductToCategoryBinding {
  @Column("varchar2", { primary: true, name: "PRODUCT_ID", length: 50 })
  productId: string;

  @Column("number", {
    primary: true,
    name: "CATEGORY_ID",
    precision: 10,
    scale: 0,
  })
  categoryId: number;

  @Column("number", {
    name: "SORT",
    precision: 6,
    scale: 0,
    default: () => "0",
  })
  sort: number;

  @ManyToOne(() => Category, (category) => category.productToCategoryBindings, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "CATEGORY_ID", referencedColumnName: "id" }])
  category: Category;

  @ManyToOne(() => Product, (product) => product.productToCategoryBindings, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "PRODUCT_ID", referencedColumnName: "article" }])
  product: Product;
}
