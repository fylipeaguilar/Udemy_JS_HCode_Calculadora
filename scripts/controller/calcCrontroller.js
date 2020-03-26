// ********* Aqui ficará as classes com as regras de negócio ************* //


class CalcController {
    // Atributos da classe
    // No JS e por convessão  "_" é entendido que é para ser privado
    constructor () {

        // Tanto os atributos como os métedos, tem que estar dentro do construtor

        // Atributo para controlar o estado de (on/off) do audio
        this._audioOnOff = false;

        //Atributo para guardar o áudio
        this._audio = new Audio('click.mp3');

        this._lastOperator = '';
        this._lastNumber = '';

        // Para guardar a operação
        this._operation = [];        
        
        // Criando um atributo da "lingua", pois será usado várias vezes no código
        this._locale = 'pr-BT'

        // O "EL" é um convenção para informar que é um "elemento" do HTML
        this._displayCalcEL = document.querySelector("#display");
        this._dateEL = document.querySelector("#data");
        this._timeEL = document.querySelector("#hora");

        this._currentDate;

        this.initialize();
        this.initButtonsEvents();
        this.initKeyboard();
        
        // O event "addEventListener" existe e é nativo do JS
        // Mas o event "addEventListenerAll" não existe e por 
        // isso estamos criando o "nosso"
        // this.addEventListenerAll() ;

    }

    pasteFromClipboard(){
        document.addEventListener('paste', e => {

            let text = e.clipboardData.getData('Text');

            this.displayCalc = parseFloat(text);

            // console.log(text);
        })
    }

    // Copiando da área de transferência do Sistema Operacional
    // Para criar a funcionalidade de uso do Ctrol+C / Ctrol+V
    copyToClipboard() {
        let input = document.createElement('input')

        input.value = this.displayCalc;

        document.body.appendChild(input);

        input.select();

        // Pegando a informação selecionada e copiando para o sistema operacional
        document.execCommand("Copy");

        // Essa linha de comando é apenas para apagar o elementado do input da tela
        // Mas o valor já foi copiado para a memória do sistema operacional.
        input.remove();
    }


    // Tudo que queremos que aconteça no inicio da funcionalidades
    // Deve entrar nesse método
    initialize(){

        // innerHTML é uma propriedade que coloca valores dentro elemento no formato HTML
        //https://www.w3schools.com/js/js_dates.asp
        // Atualização a cada 1000(ms) que é equivalente a 1s
        // O setInterval tem 2 parametros (funcao, períodoDeExecucao)

        this.setDisplayDateTime();

        setInterval(() => {

            this.setDisplayDateTime();

        }, 1000);
        
        // this._datecEL.innerHTML = "01/01/2020"
        // this._timeEL.innerHTML = "23:59"

        // Exemplo de como usar o "SET_TIME_OUT"
        // setTimeout(()=>{

        //     clearInterval(id_setInterval);

        // }, 10000)

        // Para a calculadora comecar com 0
        this.setLastNumberToDisplay();
        this.pasteFromClipboard();

        //Colocando evento de som 
        document.querySelectorAll('.btn-ac').forEach(btn => {

            btn.addEventListener('dblclick', e => {

                this.toggleAudio();

            })
        })
    }

    toggleAudio() {

        // Essa linha de comando faz trocar o estado da variável
        this._audioOnOff = !this._audioOnOff

        // if(this._audioOnOff) {
        //     this._audioOnOff = false;
        // } else {
        //     this._audioOnOff = true;
        // }
    }

    playAudio() {
        if (this._audioOnOff) {

            this._audio.currentTime = 0;
            this._audio.play();
        }
    }

    // Inicializando os eventos de teclado
    initKeyboard() {
        document.addEventListener('keyup', e => {

            this.playAudio();

            // console.log(e.key);

            switch (e.key) {
                case 'Escape': // AC = All Clear - Limpa tudo
                    this.clearAll();
                    break;
    
                case 'Backspace': // CE - Cancel Entry
                    this.cancelEntry();
                    break;
    
                case '+':
                case '-':
                case '/':
                case '*':
                case '%':
                    this.addOperation(e.key);
                    break;
                case 'Enter':
                case '=':
                    this.calc();
                    break;
                case '.':
                case ',':
                    this.addDot();
                    break;
    
                case '0': 
                case '1':
                case '2':
                case '3':
                case '4':
                case '5': 
                case '6':
                case '7':
                case '8':
                case '9':
                    // Vamos fazer um parseInt para transformar 
                    // valor de "0 ~ 9" que está em string para valor numérico
                    this.addOperation(parseInt(e.key));
                    break;

                case 'c':
                    if(e.ctrlKey)
                        this.copyToClipboard();
                    break;
            }

        });
    }

    addEventListenerAll (element, events, fn) {

        events.split(' ').forEach(event => {

            element.addEventListener(event, fn, false);

        });
    }

    clearAll(){
        this._operation = [];
        this._lastNumber = '';
        this._lastOperator = '';

        this.setLastNumberToDisplay();
    }

    cancelEntry(value){
        // Para adicionar um retirar ao array, usaremos o método "pop"
        this._operation.pop(value);

        this.setLastNumberToDisplay();
    }


    getLastOperation(){
        return this._operation[this._operation.length - 1]
    }

    setLastOperation(value) {
        this._operation[this._operation.length - 1] = value;
    }

    isOperator(value) {
        // O método indexOf realiza uma busca dos valores do array
        // em comparaçaõ com o "value" passado com parâmetro
        return (['+', '-', '*', '/', '%'].indexOf(value) > -1) 
    }

    pushOperation(value) {
        this._operation.push(value);

        if(this._operation.length > 3) {

            this.calc();
           
        }
    }

    getResult () {
        try{
            return eval(this._operation.join(""));
        } catch (e) {
            setTimeout(() =>{
                this.setError();
            // console.log(e);
            }, 1)
            
        }
        
    }

    calc () {

        let last = '';
        this._lastOperator = this.getLastItem(true);

        if(this._operation.length < 3 ) {
            
            let firstItem = this._operation[0];
            this._operation = [firstItem, this._lastOperator, this._lastNumber];
        }

        if(this._operation.length > 3) {

            last = this._operation.pop();
            this._lastNumber = this.getResult();

        } else if(this._operation.length > 3 ) {

            this._lastOperator = this.getLastItem(false)

        }

        //eval(): Tem a inteligência de calcular valor de uma string 
        let result = this.getResult();

        if (last == '%') {

            result /= 100;
            this._operation = [result];

        } else{

            this._operation = [result];

            if(last) this._operation.push(last);

        }       

        this.setLastNumberToDisplay();
    }


    getLastItem(isOperator = true){

        let lastItem;

        for(let i = this._operation.length - 1; i >= 0; i--) {

            if(this.isOperator(this._operation[i]) == isOperator) {
                lastItem = this._operation[i];
                break;
            }

        }

        if(!lastItem) {

            lastItem = (isOperator) ? this._lastOperator : this._lastNumber;

        }

        return lastItem;
    }


    setLastNumberToDisplay() {

        let lastNumber = this.getLastItem(false);

        if(!lastNumber) lastNumber = 0;

        this.displayCalc = lastNumber;

        
    }

    
    addOperation (value) {

        if(isNaN(this.getLastOperation())) {
            // String = true

            if(this.isOperator(value)) {
                // Trocar o operador
                this.setLastOperation(value);

            }  else {
                this.pushOperation(value);

                this.setLastNumberToDisplay();
            }

        } else {

            if(this.isOperator(value)) {

                this.pushOperation(value);

            } else {

                // Numero = false
                // Neste caso o "+" funciona como um operador de concatenação
                let newValue = this.getLastOperation().toString() + value.toString();

                // Para adicionar um item ao array, usaremos o método "push"
                this.setLastOperation((newValue));

                //atualizar display
                this.setLastNumberToDisplay();

            }

        }

        // console.log(this._operation);
    }

    setError(){
        this.displayCalc = "ERROR"
    }

    addDot(){
        let lastOperation = this.getLastOperation();

        if(typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1)
            return;
        
        if(this.isOperator(lastOperation) || !lastOperation) {
            this.pushOperation('0.')
        } else {
            this.setLastOperation(lastOperation.toString() + '.');
        }

        this.setLastNumberToDisplay();
        // console.log(lastOperation);
    }

    execBtn(value) {

        this.playAudio();

        switch (value) {
            case 'ac': // AC = All Clear - Limpa tudo
                this.clearAll();
                break;

            case 'ce': // CE - Cancel Entry
                this.cancelEntry();
                break;

            case 'soma':
                this.addOperation('+');
                break;
            
            case 'subtracao':
                this.addOperation('-');
                break;

            case 'divisao':
                this.addOperation('/');
                break;

            case 'multiplicacao':
                this.addOperation('*');
                break;               
            
            case 'porcento':
                this.addOperation('%');
                break;

            case 'igual':
                this.calc();
                break;

            case 'ponto':
                this.addDot();
                break;

            case '0': 
            case '1':
            case '2':
            case '3':
            case '4':
            case '5': 
            case '6':
            case '7':
            case '8':
            case '9':
                // Vamos fazer um parseInt para transformar 
                // valor de "0 ~ 9" que está em string para valor numérico
                this.addOperation(parseInt(value));
                break;


            default:
                this.setError();
                break;
        }


    }

    initButtonsEvents() {
        // Selecionando o botão e os número, por isso o "querySelectorAll"
        // Aqui estamos usando elementos Pai e Filho de um elemento, por isso usamos o caracter ">"
        let buttons = document.querySelectorAll("#buttons > g, #parts > g");

        buttons.forEach((btn, index) => {

            this.addEventListenerAll(btn, "click grag", e => {

                let textBtn = btn.className.baseVal.replace("btn-", "");

                // Para executar a ação desse botão
                this.execBtn(textBtn);
            });

            this.addEventListenerAll(btn, "mouseover mouseup mousedown", e =>{
                btn.style.cursor = "pointer";
            })
        });
    }



    // *************** GETERES ********************
    get displayCalc () {
        return this._displayCalcEL.innerHTML;
    }

    get displayTime () {
        return this._timeEL.innerHTML;
    }

    get displayDate () {
        return this._dateEL.innerHTML;
    }

    get currentDate(){
        return new Date();
    }

    // *************** GETERES ********************

    setDisplayDateTime () {
        this.displayDate = this.currentDate.toLocaleDateString(this._locale,{
            day: '2-digit',
            month: 'short', //(long, short)
            year: 'numeric'
        });
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
    }

    set displayCalc(value) {

        if(value.toString().length > 10 ) {
            this.setError();
            return false;
        }

        return this._displayCalcEL.innerHTML = value
    }

    set displayTime(value) {
        return this._timeEL.innerHTML = value
    }

    set displayDate(value) {
        return this._dateEL.innerHTML = value
    }

    

    set currentDate(value) {
        this._currentDate = value
    }

    // Métodos das classe (ação)

}