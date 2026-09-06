import { cn } from "@repo/utils";
import PriceFormatter from './PriceFormatter';

interface Props {
  price: number | undefined;
  discount?: number | undefined;
  className?: string;
}

const PriceView = ({ price, discount, className }: Props) => {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center gap-1', className)}>
      <PriceFormatter amount={price} className='text-ushop-purple'/>
      {price && discount && discount > 0 ? (
        <PriceFormatter amount={price + (discount * price)/100} className='text-ushop-light-text font-normal line-through'/>
      ) : null}
    </div>
  )
}
 
export default PriceView