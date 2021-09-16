/**
 *  Created by Debiasi
 *  20/07/2020
 */

import Resource from './Resource.js'

export default class User extends Resource {

    /**
     * @name endpoint
     *
     * @return string
     */
    static endpoint() {
        return 'user';
    }


    /**
     * @name structure
     *
     * @return object
     */
    static structure() {
        return {
            id: null,
            admin: null,
            email: null,
            enable: null,

            companies: {}
        }
    }


    /**
     * @name forges
     *
     * @return object
     */
    static forges() {
        return {}
    }


    /**
     * @name command
     * @param {string} command to be executed
     * @param {object} options
     * @return object
     */
    // eslint-disable-next-line no-unused-vars
    static command(command, options = {}) {
        switch (command) {
            case 'get':
                return this.store().getters.user

            case 'get.id':
                var user = this.store().getters.user
                return user ? user.id : null

            case 'get.company':
                return this.store().getters.user.companies[0]

        }
    }
}


