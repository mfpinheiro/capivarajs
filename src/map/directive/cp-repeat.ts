import _ from 'lodash';
import { Constants } from '../../constants';
import { MapDom } from '../map-dom';
import { Scope } from '../../scope/scope';
import { Controller } from '../../controller';
import { Common } from '../../common';

export class CPRepeat {

    private map: MapDom;
    private attribute;
    private element;
    private originalElement;
    private referenceNode;
    private lastArray = [];
    private regex;

    constructor(_element: HTMLElement, _map: MapDom) {
        this.element = _element.cloneNode(true);
        this.originalElement = _element;
        this.map = _map;
        this.attribute = _element.getAttribute(Constants.REPEAT_ATTRIBUTE_NAME).replace(/\s+/g, ' ');
        this.regex = new RegExp('^[\\s*|\\S]+\\s+in\\s+\\S+\\s*', 'g');
        let matchs = this.attribute.match(this.regex);
        if(!this.attribute || (!matchs || matchs.length == 0)){
            throw `syntax error invalid ${Constants.REPEAT_ATTRIBUTE_NAME} expresion: ${this.attribute}`;
        }
        this.referenceNode = document.createComment('start repeat ' + this.attribute);
        this.originalElement.replaceWith(this.referenceNode);
        Common.getScope(this.originalElement).$on('$onInit', () => this.applyLoop());
    }

    applyLoop() {
        let attributeAlias = this.attribute.substring(0, this.attribute.indexOf(Constants.REPEAT_ATTRIBUTE_OPERATOR)).replace(/ /g, '');
        let attributeScope = this.attribute.substring(this.attribute.indexOf(Constants.REPEAT_ATTRIBUTE_OPERATOR) + Constants.REPEAT_ATTRIBUTE_OPERATOR.length, this.attribute.length).replace(/ /g, '');
        let array = _.get(Common.getScope(this.originalElement).scope, attributeScope);
        if (array && !_.isEqual(array, this.lastArray)) {
            this.lastArray = array.slice();
            this.removeChildes();
            this.loop(array.slice().reverse(), attributeAlias);            
        }
    }

    removeChildes(){
        Array.from(this.referenceNode.parentNode.childNodes)
            .forEach((elm: any) => {
                if(elm.nodeName == this.originalElement.nodeName || elm.nodeName == '#comment' && elm.data == 'end repeat ' + this.attribute){
                    this.referenceNode.parentNode.removeChild(elm);
                }
            })
    }

    loop(array, attributeAlias){
        array.map((row, index) => {
            let elm = this.element.cloneNode(true);
            elm.removeAttribute(Constants.REPEAT_ATTRIBUTE_NAME);
            elm.classList.add('binding-repeat');
            Common.appendAfter(this.referenceNode, elm);
            new Controller(elm, () => { });
            Common.getScope(elm).scope[attributeAlias] = row;
            Common.getScope(elm).scope[Constants.REPEAT_INDEX_NAME] = index;
            return elm;
        });
        this.referenceNode.parentNode.appendChild(document.createComment('end repeat ' + this.attribute));
    }

}