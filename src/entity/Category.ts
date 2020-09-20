import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany, PrimaryGeneratedColumn,
} from "typeorm";
import { Region } from "./Region";
import { ProductToCategoryBinding } from "./ProductToCategoryBinding";
import { RecommendedProducts } from "./RecommendedProducts";

@Index("CATEGORY_PARENT_ID_IDX", ["parentId"], {})
@Index("CATEGORY_REGION_ID_IDX", ["regionId"], {})
@Entity("CATEGORY")
export class Category {
  @Column("varchar2", {
    name: "PRODUCT_DUMMY_PICTURE",
    nullable: true,
    length: 200,
  })
  productDummyPicture: string | null;

  @PrimaryGeneratedColumn( { name: "ID" })
  id: number;

  @Column("varchar2", { name: "NAME", length: 255 })
  name: string;

  @Column("number", { name: "REGION_ID", precision: 10, scale: 0 })
  regionId: number;

  @Column("number", {
    name: "HIDDEN",
    precision: 1,
    scale: 0,
    default: () => "0",
  })
  hidden: number;

  @Column("number", {
    name: "SORT",
    precision: 6,
    scale: 0,
    default: () => "0",
  })
  sort: number;

  @Column("number", { name: "PARENT_ID", precision: 10, scale: 0 })
  parentId: number;

  @ManyToOne(() => Region, (region) => region.categories, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "REGION_ID", referencedColumnName: "id" }])
  region: Region;

  @ManyToOne(() => Category, (category) => category.categories, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "PARENT_ID", referencedColumnName: "id" }])
  parent: Category;

  @OneToMany(() => Category, (category) => category.parent)
  categories: Category[];

  @OneToMany(
    () => ProductToCategoryBinding,
    (productToCategoryBinding) => productToCategoryBinding.category
  )
  productToCategoryBindings: ProductToCategoryBinding[];

  @OneToMany(
    () => RecommendedProducts,
    (recommendedProducts) => recommendedProducts.category
  )
  recommendedProducts: RecommendedProducts[];
}
