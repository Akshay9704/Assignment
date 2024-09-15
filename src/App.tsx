import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { FaChevronDown } from "react-icons/fa";
import { OverlayPanel } from "primereact/overlaypanel";
import "primereact/resources/themes/lara-light-cyan/theme.css";

function App() {
  const [artworks, setArtworks] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [rowClick, setRowClick] = useState<boolean>(true);
  const [first, setFirst] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [selectRows, setSelectRows] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const API = "https://api.artic.edu/api/v1/artworks";

  const fetchData = async (page: number) => {
    return fetch(API + `?page=${page}`)
      .then((response) => response.json())
      .then((data) => data);
  };

  const onPageChange = (e: any) => {
    setFirst(e.first);
    setPage(e.page + 1);
  };

  const op = useRef<OverlayPanel | null>(null);
  const chevronRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchData(page).then((data) => {
      setArtworks(data.data);
      setTotalRecords(data.pagination.total_pages);
      setLoading(false);
    });
  }, [page]);

  // Function to select rows
  const handleRowSelection = () => {
    setLoading(true);
    let selected: any[] = [];
    let remainingRows = selectRows;

    const selectRowsAcrossPages = async (page: number) => {
      const data = await fetchData(page);
      const rowsOnCurrentPage = data.data.length;
      const rowsToSelect = Math.min(remainingRows, rowsOnCurrentPage);

      selected = [...selected, ...data.data.slice(0, rowsToSelect)];
      remainingRows -= rowsToSelect;

      if (remainingRows > 0 && page < data.pagination.total_pages) {
        await selectRowsAcrossPages(page + 1);
      } else {
        setSelectedProducts(selected);
        setLoading(false);
        op.current?.hide();
      }
    };

    selectRowsAcrossPages(page);
  };

  return (
    <>
      <div className="card m-10">
        {loading && (
          <span className="loading loading-spinner text-secondary"></span>
        )}
        <DataTable
          value={artworks}
          selectionMode={rowClick ? "multiple" : null}
          selection={selectedProducts}
          onSelectionChange={(e: any) => setSelectedProducts(e.value)}
          dataKey="id"
          tableStyle={{ minWidth: "50rem" }}
        >
          <Column
            selectionMode="multiple"
            headerStyle={{ width: "3rem" }}
          ></Column>
          <Column
            style={{ cursor: "pointer", fontSize: "18px" }}
            header={
              <div ref={chevronRef}>
                <FaChevronDown
                  onClick={(e) => op.current?.toggle(e, chevronRef.current!)}
                />
              </div>
            }
          ></Column>
          <Column field="title" header="Title"></Column>
          <Column field="place_of_origin" header="Place of Origin"></Column>
          <Column field="artist_display" header="Artist Display"></Column>
          <Column field="inscriptions" header="Inscription"></Column>
          <Column field="date_start" header="Date Start"></Column>
          <Column field="date_end" header="Date End"></Column>
        </DataTable>
        <OverlayPanel ref={op} appendTo={document.body}>
          <div>
            <div>
              <input
                style={{ outline: "none", padding: "8px" }}
                type="number"
                placeholder="Select rows..."
                value={selectRows}
                onChange={(e) => setSelectRows(parseInt(e.target.value))}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "end",
                marginTop: "10px",
              }}
            >
              <button
                style={{ padding: "8px", cursor: "pointer" }}
                onClick={handleRowSelection}
                disabled={loading}
              >
                Submit
              </button>
              {loading && (
                <span className="loading loading-spinner text-secondary"></span>
              )}
            </div>
          </div>
        </OverlayPanel>
        <Paginator
          first={first}
          rows={10}
          totalRecords={totalRecords}
          onPageChange={onPageChange}
        />
      </div>
    </>
  );
}

export default App;
