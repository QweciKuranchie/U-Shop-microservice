import { Category } from "@repo/sanity";

interface Props {
  categories: Category[];
}

const Categories = ({ categories }: Props) => {
  return (
    <div className="py-5">
      <div className="flex flex-wrap gap-2">
        {categories?.map((cat) => (
          <span key={cat._id} className="px-3 py-1 bg-gray-100 rounded-full text-xs">
            {cat.title}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Categories;
