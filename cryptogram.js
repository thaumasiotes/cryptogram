cg = {

    handle_ciphertext: function() {
        // process for character frequency
        let ciphertext =
            document.querySelector('#cg_ciphertext > textarea').value;
        // display sorted list of characters
        // apply character mapping, if present
        // display plaintext
        this.show_plaintext(ciphertext);
    },

    apply_map: function() {
    },

    show_plaintext: function(text) {
        text = text.trim();
        text = text.split('\n');

        let span = document.createElement('span');
        let para = document.createElement('p');
        let add_line_break = false;
        for(let line = 0; line < text.length; line++) {
            // treat double newline as paragraph break
            if( text[line].length == 0 ) {
                span.appendChild(para);
                para = document.createElement('p');
                add_line_break = false;
                continue;
            }

            if( add_line_break ) {
                para.appendChild( document.createElement('br') );
            }
            para.appendChild( document.createTextNode(text[line]) );
            add_line_break = true;
        }
        // assume input did not end with \n\n, so add the last paragraph
        // worst case, we get an extra empty <p></p>
        span.appendChild(para);

        document.getElementById('cg_plaintext').firstChild.replaceWith(span);
    },

}
