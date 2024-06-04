function exportToCSV(modalId) {
    var table = document.getElementById(modalId).querySelector('table');

    var csv = [];
    var rows = table.querySelectorAll('tr');
    for (var i = 0; i < rows.length; i++) {
        var row = [], cols = rows[i].querySelectorAll('td, th');
        for (var j = 0; j < cols.length; j++) {
            row.push(cols[j].innerText);
        }
        csv.push(row.join(','));
    }
    var csvString = csv.join('\n');
    var link = document.createElement('a');
    link.style.display = 'none';
    link.setAttribute('target', '_blank');
    link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvString));
    link.setAttribute('download', 'data.csv');
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
}

window.addEventListener('DOMContentLoaded', event => {

    // Toggle the side navigation
    const sidebarToggle = document.body.querySelector('#sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', event => {
            event.preventDefault();
            document.body.classList.toggle('sb-sidenav-toggled');
            localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
        });
    }

});

document.addEventListener('DOMContentLoaded', function () {
    const today = new Date().toISOString().split('T')[0];
    const dateStartInput = document.getElementById('date_start');
    const dateEndInput = document.getElementById('date_end');

    dateStartInput.min = today;

    dateStartInput.addEventListener('change', function () {
        dateEndInput.min = dateStartInput.value;
    });

    dateEndInput.addEventListener('change', function () {
        if (dateEndInput.value < dateStartInput.value) {
            dateEndInput.value = dateStartInput.value;
        }
    });


});

function selectColumns(editor, csv, header) {
    let selectEditor = new DataTable.Editor();
    let fields = editor.order();

    for (let i = 0; i < fields.length; i++) {
        let field = editor.field(fields[i]);

        selectEditor.add({
            label: field.label(),
            name: field.name(),
            type: 'select',
            options: header,
            def: header[i]
        });
    }

    selectEditor.create({
        title: 'Map CSV fields',
        buttons: 'Import ' + csv.length + ' records',
        message: 'Select the CSV column you want to use the data from for each field.',
        onComplete: 'none'
    });

    selectEditor.on('submitComplete', function (e, json, data, action) {
        editor.create(csv.length, {
            title: 'Confirm import',
            buttons: 'Submit',
            message: 'Click the <i>Submit</i> button to confirm the import of ' +
                csv.length + ' rows of data. Optionally, override the value for a field to set a common value by clicking on the field below.'
        });

        for (var i = 0; i < fields.length; i++) {
            let field = editor.field(fields[i]);
            let mapped = DataTable.util.get(field.name())(data);

            for (let j = 0; j < csv.length; j++) {
                field.multiSet(j, csv[j][mapped]);
            }
        }
    });
}

// DataTable Editor initialization for data table
const editor = new DataTable.Editor({
    ajax: '/your-server-endpoint',
    table: '#datatablesSimple',
    fields: [
        { label: 'NIK', name: 'nik' },
        { label: 'Nomor KK', name: 'nomor_kk' },
        { label: 'Nama', name: 'nama_lengkap' },
        { label: 'Alamat', name: 'alamat' },
        { label: 'Jenis Kelamin', name: 'jenis_kelamin' },
        { label: 'Tempat Lahir', name: 'tempat_lahir' },
        { label: 'Tanggal Lahir', name: 'tanggal_lahir', type: 'datetime' },
        { label: 'Agama', name: 'agama' },
        { label: 'Pendidikan', name: 'pendidikan' },
        { label: 'Jenis Pekerjaan', name: 'jenis_pekerjaan' },
        { label: 'status perkawinan', name: 'jenis_pekerjaan' }
    ]
});

// DataTable Editor for CSV upload
const uploadEditor = new DataTable.Editor({
    fields: [
        {
            label: 'CSV file:',
            name: 'csv',
            type: 'upload',
            ajax: function (files, done) {
                Papa.parse(files[0], {
                    header: true,
                    skipEmptyLines: true,
                    complete: function (results) {
                        if (results.errors.length) {
                            console.log(results);
                            uploadEditor
                                .field('csv')
                                .error('CSV parsing error: ' + results.errors[0].message);
                        }
                        else {
                            selectColumns(editor, results.data, results.meta.fields);
                        }
                        done([0]);
                    }
                });
            }
        }
    ]
});

// Event listener for CSV file upload form submission
document.getElementById('uploadForm').addEventListener('submit', function (event) {
    event.preventDefault();

    let formData = new FormData();
    formData.append('csvFile', document.getElementById('csvFile').files[0]);

    fetch('/upload-csv', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to upload CSV file');
        }
    })
    .then(data => {
        if (data.success && data.results) {
            // Directly use the parsed CSV data with headers
            selectColumns(editor, data.results.data, data.results.meta.fields);
        } else {
            alert('Failed to upload CSV file: ' + data.error || "Unknown error");
        }
    })
    .catch(error => {
        console.error('Error uploading CSV file:', error);
        alert('An error occurred while uploading CSV file');
    });
});


// DataTable initialization
const table = new DataTable('#datatablesSimple', {
    ajax: '/your-server-endpoint',
    columns: [
        { data: 'nik' },
        { data: 'nomor_kk' },
        { data: 'nama_lengkap' },
        { data: 'alamat' },
        { data: 'jenis_kelamin' },
        { data: 'tanggal_lahir' },
        { data: 'tempat_lahir' },
        { data: 'agama' },
        { data: 'jenis_kelamin' },
        { data: 'jenis_pekerjaan' },
        { data: 'pendidikan' },
        { data: 'status_perkawinan' }
    ],
    layout: {
        topStart: {
            buttons: [
                { extend: 'create', editor: editor },
                { extend: 'edit', editor: editor },
                { extend: 'remove', editor: editor },
                {
                    extend: 'csv',
                    text: 'Export CSV',
                    className: 'btn-space',
                    exportOptions: {
                        orthogonal: null
                    }
                },
                {
                    text: 'Import CSV',
                    action: function () {
                        uploadEditor.create({
                            title: 'CSV file import'
                        });
                    }
                },
                {
                    extend: 'selectAll',
                    className: 'btn-space'
                },
                'selectNone'
            ]
        }
    },
    select: true
});
