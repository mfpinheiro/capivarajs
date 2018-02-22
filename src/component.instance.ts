import { Constants } from './constants';
import WatchJS from 'melanke-watchjs';
import _ from 'lodash';
import { setTimeout } from 'timers';

export class ComponentInstance {

    config: any;
    element: any;
    contextObj;
    componentScope;

    constructor(_element, _config) {
        this.element = _element;
        this.config = _config;

        this.element.innerHTML = this.config.template;

        window['capivara'].controller(this.element, (scope) => {
            this.componentScope = scope;
            if(_config.controller) _config.controller(scope);
        });

        this.element[Constants.SCOPE_ATTRIBUTE_NAME].scope['$bindings']  = {};
        this.element[Constants.SCOPE_ATTRIBUTE_NAME].scope['$constants'] = {};
        this.element[Constants.SCOPE_ATTRIBUTE_NAME].scope['$functions'] = {};
    }

    /**
     * @description Renderiza o template no elemento.
     */
    build() {
        if(this.componentScope.$onInit) this.componentScope.$onInit();
        window['capivara'].$on('DOMNodeRemoved', () => setTimeout(() => { if(!document.body.contains(this.element)) this.destroy(); }, 0));
    }

    /**
     * @description Função executada quando o elemento é destruído do documento.
     */
    destroy(){
        if(this.componentScope.$destroy) this.componentScope.$destroy();
    }

    /**
     * @param obj Contexto dos bindings, o contexto é o objeto que possui os valores dos bindings
     */
    context(obj) {
        this.contextObj = obj;
        return this;
    }

    /**
     * @description Cria os bindings que o componente espera.
     * @param _bindings Objeto com o nome dos bindings
     */
    bindings(_bindings = {}) {
        if(!this.contextObj){
            console.error('Bindings ainda não aplicados. Primeiro, é necessário informar o contexto.');
            return this;
        }
        this.config.bindings.forEach(key => {
            if (_bindings[key]) {
                this.element[Constants.SCOPE_ATTRIBUTE_NAME].scope['$bindings'][key] = _.get(this.contextObj, _bindings[key]);
                let keyObserve = _bindings[key].indexOf('.') != -1 ? _bindings[key].substring(0, _bindings[key].indexOf('.')) : _bindings[key];

                /**
                 * @description Observa o contexto, quando houver alteração é modificado no escopo do componente
                 */
                WatchJS.watch(this.contextObj, keyObserve,
                    () => {
                        this.element[Constants.SCOPE_ATTRIBUTE_NAME].scope['$bindings'][key] = _.get(this.contextObj, _bindings[key]);
                    });
                    
                /**
                 * @description Observa o componente quando houver alteração é modificado o contexto
                 */
                WatchJS.watch(this.element[Constants.SCOPE_ATTRIBUTE_NAME].scope['$bindings'], key,
                    () => { 
                        _.set(this.contextObj, _bindings[key], this.element[Constants.SCOPE_ATTRIBUTE_NAME].scope['$bindings'][key]);
                    });

            }
        });
        return this;
    }

    /**
     * @description Crie valores sem referências
     * @param _constants Objeto com o nome das constants
     */
    constants(_constants) {
        this.config.constants.forEach(key => {
            if (_constants[key]) {
                this.element[Constants.SCOPE_ATTRIBUTE_NAME].scope['$constants'][key] = _constants[key];
            }
        });
        return this;
    }

    functions(_functions){
        this.config.functions.forEach(key => {
            if (_functions[key]) {
                this.element[Constants.SCOPE_ATTRIBUTE_NAME].scope['$functions'][key] = _functions[key];
            }
        });
        return this;
    }

}