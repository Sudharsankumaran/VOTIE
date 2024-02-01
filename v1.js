const rows = [
    document.querySelector('#one'),
    document.querySelector('#two'),
    document.querySelector('#three'),
    document.querySelector('#four'),
    document.querySelector('#five'),
    document.querySelector('#six'),
    document.querySelector('#seven'),
    document.querySelector('#eight'),
    document.querySelector('#nine'),
    document.querySelector('#ten'),
    document.querySelector('#eleven'),
    document.querySelector('#twelve')
];

fetch('https://api.jikan.moe/v4/anime?q=&sfw')
    .then((res) => res.json())
    .then((datas) => {
        for (let i = 0; i < 12; i++) {
            let Anime = datas.data[i];

            const imageUrl = Anime.images.jpg.image_url || '';

            rows[i].innerHTML = `
                <img src="${imageUrl}" alt='animeimage' class='Animepik'/>
                <h3 class='title'>${Anime.title}</h3>`;
        }
    });
   

    let voteCounts = {};

// Open the IndexDB database
const request = indexedDB.open('voteDB', 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;

    // Create an object store to store vote counts
    const objectStore = db.createObjectStore('votes', { keyPath: 'rowId' });

    // Create an index to quickly retrieve vote counts
    objectStore.createIndex('count', 'count', { unique: false });
};

request.onsuccess = function (event) {
    const db = event.target.result;

    // Read existing vote counts from IndexDB
    const transaction = db.transaction(['votes'], 'readonly');
    const objectStore = transaction.objectStore('votes');

    const getAllRequest = objectStore.getAll();
    getAllRequest.onsuccess = function (event) {
        const storedVotes = event.target.result;
        storedVotes.forEach((vote) => {
            voteCounts[vote.rowId] = vote.count;
        });

        // Update progress bar based on stored votes
        updateProgressBar();
    };
};

// Handle errors
request.onerror = function (event) {
    console.error('Error opening IndexDB:', event.target.errorCode);
};

function vote(rowId) {
    // Increment the vote count for the clicked row
    voteCounts[rowId] = (voteCounts[rowId] || 0) + 1;

    // Update IndexDB
    updateIndexDB(rowId, voteCounts[rowId]);

    // Update the progress bar
    updateProgressBar();
}

function unvote(rowId) {
    // Decrease the vote count for the clicked row
    voteCounts[rowId] = Math.max((voteCounts[rowId] || 0) - 1, 0);

    // Update IndexDB
    updateIndexDB(rowId, voteCounts[rowId]);

    // Update the progress bar
    updateProgressBar();
}

function updateIndexDB(rowId, count) {
    const request = indexedDB.open('voteDB', 1);

    request.onsuccess = function (event) {
        const db = event.target.result;

        // Update vote count in IndexDB
        const transaction = db.transaction(['votes'], 'readwrite');
        const objectStore = transaction.objectStore('votes');
        const updateRequest = objectStore.put({ rowId, count });

        // Handle successful update
        updateRequest.onsuccess = function () {
            console.log(`Vote count for row ${rowId} updated to ${count} in IndexDB.`);
        };
    };
}

function updateProgressBar() {
    // Find the maximum vote count among all rows
    const maxVotes = Math.max(...Object.values(voteCounts));

    // Update the progress bar for each row based on the percentage of max votes
    Object.keys(voteCounts).forEach((key) => {
        const progressBar = document.getElementById(`progress-${key}`);
        const percentage = (voteCounts[key] / maxVotes) * 100;

        progressBar.style.setProperty('--percentage', percentage);
        progressBar.dataset.transition = 'true';
        progressBar.dataset.progress = `${percentage.toFixed(2)}%`; // Display the percentage in the progress bar
    });
}

function logout() {
    // Redirect to the first page
    window.location.href = "index.html";
}

