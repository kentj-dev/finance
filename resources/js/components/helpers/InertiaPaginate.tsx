// components/ui/inertia-paginate.tsx
import { cleanQueryObject } from '@/utils/cleanQueryObject';
import { router } from '@inertiajs/react';
import ReactPaginate from 'react-paginate';

interface InertiaPaginateProps {
    currentPage: number;
    lastPage: number;
    baseRoute: string;
    query?: Record<string, string | number | undefined>;
}

export const InertiaPaginate: React.FC<InertiaPaginateProps> = ({ currentPage, lastPage, baseRoute, query = {} }) => {
    const handlePageChange = ({ selected }: { selected: number }) => {
        const page = selected + 1;
       
        const params = cleanQueryObject({
            page: page > 1 ? page : undefined,
            ...query,
        });

        router.get(route(baseRoute), Object.keys(params).length ? params : undefined, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <ReactPaginate
            previousLabel="← Prev"
            nextLabel="Next →"
            breakLabel="..."
            breakClassName="text-gray-400"
            pageCount={lastPage}
            marginPagesDisplayed={1}
            pageRangeDisplayed={3}
            forcePage={currentPage - 1}
            onPageChange={handlePageChange}
            containerClassName="pagination flex items-center gap-1 text-sm"
            activeClassName="bg-blue-500 text-white rounded hover:!bg-blue-600"
            pageClassName="border rounded hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-700"
            previousClassName="border rounded hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-700"
            nextClassName="border rounded hover:bg-gray-100 cursor-pointer dark:hover:bg-gray-700"
            pageLinkClassName="block w-full h-full px-3 py-1"
            nextLinkClassName="block w-full h-full px-3 py-1"
            previousLinkClassName="block w-full h-full px-3 py-1"
            disabledClassName="pointer-events-none opacity-50"
        />
    );
};
