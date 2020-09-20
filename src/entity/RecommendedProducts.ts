import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Category } from "./Category";
import { Product } from "./Product";

@Index("RECOMMENDED_PRODUCTS_CATEGORY_ID_IDX", ["categoryId"], {})
@Index("RECOMMENDED_PRODUCTS_PRODUCT_ID_IDX", ["productId"], {})
@Index("SYS_C007804", ["categoryId", "productId"], { unique: true })
@Entity("RECOMMENDED_PRODUCTS")
export class RecommendedProducts {
  @Column("number", {
    primary: true,
    name: "CATEGORY_ID",
    precision: 10,
    scale: 0,
  })
  categoryId: number;

  @Column("varchar2", { name: "RECOMMENDED_PRODUCTS", length: 6000})
  recommendedProducts: string[];

  @Column("varchar2", { primary: true, name: "PRODUCT_ID", length: 50 })
  productId: string;

  @ManyToOne(() => Category, (category) => category.recommendedProducts, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "CATEGORY_ID", referencedColumnName: "id" }])
  category: Category;

  @ManyToOne(() => Product, (product) => product.recommendedProducts, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "PRODUCT_ID", referencedColumnName: "article" }])
  product: Product;
}
