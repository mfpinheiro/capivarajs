import _ from 'lodash';
import { Constants } from './constants';

export namespace Common {

    /**
     * @description Executa o eval alterando as propriedades do source para seus determinados valores dentro do contexto.
     * @param source
     * @param context
     */
    export function evalInContext(source, context) {
        if (source) {
            source.split(' ').forEach(word => {
                let firstKey = (word.indexOf('.') != -1 ? word.substring(0, word.indexOf('.')) : word).replace(/ /g, '');
                if (firstKey && word && context && context.hasOwnProperty(firstKey)) {
                    let value = _.get(context, word.replace(/ /g, ''));
                    if (window['capivara'].isString(value)) {
                        source = source.replace(word, value != null ? "'" + value + "'" : null);
                    } else {
                        source = source.replace(word, value != null ? value : null);
                    }
                }
            });
        }
        return eval(source);
    }

    export function getAttributeCpShow(element) {
        return element.getAttribute(Constants.SHOW_ATTRIBUTE_NAME);
    }

    export function getAttributeCpIf(element) {
        return element.getAttribute(Constants.IF_ATTRIBUTE_NAME);
    }

    export function getAttributeCpElseIf(element) {
        return element.getAttribute(Constants.ELSE_IF_ATTRIBUTE_NAME);
    }

    export function getAttributeCpElse(element) {
        return element.getAttribute(Constants.ELSE_ATTRIBUTE_NAME);
    }

    export function getAttributeCpInit(element) {
        return element.getAttribute(Constants.INIT_ATTRIBUTE_NAME);
    }

    export function getScope(element) {
        return element[Constants.SCOPE_ATTRIBUTE_NAME];
    }

    export function getScopeParent(element) {
        if (getScope(element)) {
            return getScope(element).scope;
        }
        if (element.parentNode) {
            return getScopeParent(element.parentNode);
        }
    }

    export function getCallbackClick(element, attribute) {
        let callback = _.get(getScope(element).scope, attribute.substring(0, attribute.indexOf('(')));
        if (!callback && element.parentNode && getScope(element.parentNode)) {
            return getCallbackClick(element.parentNode, attribute);
        }
        return callback;
    }

    export function isNative(fn) {
        return (/\{\s*\[native code\]\s*\}/).test('' + fn);
    }

    export function destroyElement(element, elementComment) {
        element.replaceWith(elementComment);
        if (element.$instance) element.$instance.destroy();
    }

    export function createElement(element,elementComment) {
        elementComment.replaceWith(element);
        if (element.$instance) element.$instance.initController();
    }

    export function isValidCondition(element, condition) {
        let scope = getScope(element);
        if (!(element.parentNode && element.parentNode.classList.contains('binding-repeat')) && scope.$parent) {
            scope = scope.$parent;
        }
        return evalInContext(condition, scope.scope);
    }

    export function appendBefore(element, elementToInsert){
        element.parentNode.insertBefore(elementToInsert, element);
    }

    export function appendAfter(element, elementToInsert){
        element.parentNode.insertBefore(elementToInsert, element.nextSibling);
    }

}

