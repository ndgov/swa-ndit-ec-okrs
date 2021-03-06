import {
    defineStore
} from 'pinia'
import {
    useDataStore
} from './data'

export const useAppStore = defineStore({
    id: 'app',
    state: () => ({
        selectedOKR: null,
        selectedTeam: null,
        selectedPeriodID: "1",
        selectedPeriod: null,
        settings: ["filter-related", "show-progress"],
    }),
    getters: {
        isFilterRelated: state => {
            return state.settings.includes("filter-related");
        },
        getBuildHash: () => {
            return JSON.parse(process.env.COMMIT_HASH);
        }
    },
    actions: {
        loadState() {
            // load cached data
            if (localStorage.getItem('selectedPeriodID')) {
                try {
                    console.log('loading selectedPeriodID from local storage');
                    this.selectedPeriodID = JSON.parse(localStorage.getItem('selectedPeriodID'));
                    console.log(`loaded selectedPeriodID from local storage - ${this.selectedPeriodID}`);
                } catch(e) {
                    localStorage.removeItem('selectedPeriodID');
                }    
            }
            if (localStorage.getItem('selectedPeriod')) {
                try {
                    console.log('loading selectedPeriod from local storage');
                    this.selectedPeriod = JSON.parse(localStorage.getItem('selectedPeriod'));
                    console.log(`loaded selectedPeriod from local storage - ${this.selectedPeriod}`);
                } catch(e) {
                    localStorage.removeItem('selectedPeriod');
                }    
            }
        },

        /**
         * @param {number} _id - Selected OKR ID
         * @param {boolean} refresh
         */
        setSelected(_id
            , refresh = false
        ) {

            const dataStore = useDataStore();

            if (this.selectedOKR && this.selectedOKR.id == _id && !refresh) {
                if (this.isFilterRelated) {
                    this.settings = this.settings.filter(setting => setting != "filter-related");
                } else {
                    this.settings.push("filter-related");
                }

            } else {
                this.resetSelected();

                this.selectedOKR = dataStore.okrs.find(o => o.id == _id);
                this.selectedOKR.related = 0;

                dataStore.updateRelated(this.selectedOKR);
            }

            // Update display statuses                        
            dataStore.teams.forEach((team) => {
                team.displayOKRs = true;
                if (this.isFilterRelated && !dataStore.relatedTeams.includes(parseInt(team.id))) {
                    team.displayTeam = false;
                } else {
                    team.displayTeam = true;
                }
            });
             dataStore.updateOkrDisplayFlag(this.selectedOKR);
        },

        resetSelected() {
            const dataStore = useDataStore();

            this.selectedOKR = null;
            this.refOKRsX = [];
            this.supOKRsX = [];

            dataStore.okrs.forEach((okr) => {
                okr.related = null;
            });
        },

    }
})