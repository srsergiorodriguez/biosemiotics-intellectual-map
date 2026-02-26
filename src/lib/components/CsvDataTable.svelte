<script>
  import { 
    DataTable, 
    Toolbar, 
    ToolbarContent, 
    ToolbarSearch,
    ToolbarMenu,
    ToolbarMenuItem,
    ComboBox,
    Pagination 
  } from 'carbon-components-svelte';
  
  import "carbon-components-svelte/css/g10.css";

  export let rawData = [];
  
  // Optional configuration props
  export let expandableColumn = ""; // e.g., "Abstract". If provided, moves this column to an expandable row.
  export let filterColumn = ""; // e.g., "Year". If provided, creates a dropdown filter for this column.

  // Generate headers, ignoring the expandable column so it doesn't clutter the main table view
  $: headers = rawData.length > 0 
    ? Object.keys(rawData[0])
        .filter(key => key !== expandableColumn)
        .map(key => ({ key: key, value: key.charAt(0).toUpperCase() + key.slice(1) })) 
    : [];

  // Extract unique values for the dropdown filter (if filterColumn is provided)
  $: filterOptions = filterColumn && rawData.length > 0
    ? [...new Set(rawData.map(item => item[filterColumn]))]
        .filter(Boolean)
        .map(val => ({ id: val, text: val.toString() }))
    : [];

  let selectedFilterId = "";

  // Generate rows, applying the custom dropdown filter if one is selected
  $: rows = rawData
    .filter(row => !selectedFilterId || row[filterColumn] === selectedFilterId)
    .map((row, index) => ({ 
      id: index.toString(), 
      ...row 
    }));

  let pageSize = 5;
  let page = 1;

  // Function to handle CSV export
  function downloadCSV() {
    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(rows[0]).filter(k => k !== 'id').join(",") + "\n"
      + rows.map(e => Object.keys(e).filter(k => k !== 'id').map(k => `"${e[k]}"`).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "biosemiotics_data_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
</script>

<div class="table-container">
  <DataTable
    sortable
    expandable={expandableColumn !== ""}
    {headers}
    {rows}
    {pageSize}
    {page}
  >
    <svelte:fragment slot="expanded-row" let:row>
      <div class="expanded-content">
        {row[expandableColumn]}
      </div>
    </svelte:fragment>

    <Toolbar>
      <ToolbarContent>
        {#if filterColumn}
          <div class="filter-wrapper">
            <ComboBox
              titleText=""
              placeholder={`Filter by ${filterColumn}...`}
              items={filterOptions}
              bind:selectedId={selectedFilterId}
              shouldFilterItem={(item, value) => item.text.toLowerCase().includes(value.toLowerCase())}
            />
          </div>
        {/if}

        <ToolbarSearch persistent shouldFilterRows />
        
        <!-- <ToolbarMenu>
          <ToolbarMenuItem on:click={downloadCSV}>
            Download as CSV
          </ToolbarMenuItem>
        </ToolbarMenu> -->
      </ToolbarContent>
    </Toolbar>
  </DataTable>

  <Pagination
    bind:pageSize
    bind:page
    totalItems={rows.length}
    pageSizes={[5, 10, 25, 50, 100]}
  />
</div>

<style>
  .table-container {
    margin-top: 1.5rem;
    margin-bottom: 2.5rem;
    border: solid 1px lightgray;
  }
  .expanded-content {
    padding: 1rem;
    white-space: pre-wrap;
    max-width: 800px;
    line-height: 1.5;
  }
  .filter-wrapper {
    width: 250px;
    margin-right: 1rem;
  }
</style>